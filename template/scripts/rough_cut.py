"""
Decupagem automática de vídeo BRUTO → vídeo cortado pronto para o motion.

Replica o estilo de corte do padrão MotionPly:
  * o vídeo começa JÁ na primeira letra da primeira palavra (onset de energia, ~1 frame antes);
  * silêncios, respirações longas e trechos de baixo ruído são removidos;
  * pausas entre palavras ficam curtas (≤ ~0,15 s no meio da frase, ≤ ~0,30 s em fim de frase);
  * tomadas repetidas (a mesma frase dita de novo logo em seguida, frases abandonadas no meio)
    são removidas — fica sempre a ÚLTIMA tomada, que costuma ser a boa;
  * palavras gaguejadas em sequência ("para para") viram uma só;
  * cortes alinhados a frames de 30 FPS, com micro-fade de áudio para não estalar.

Uso:
    python scripts/rough_cut.py "C:/.../bruto.MOV"            # gera bruto_cortado.mp4 + relatório
    python scripts/rough_cut.py "C:/.../bruto.MOV" --dry-run  # só o relatório (decupagem_bruto.txt)
    python scripts/render_cut.py                              # re-renderiza a partir de cortes.json (após ajuste manual)
Depois:
    python scripts/prep_video.py bruto_cortado.mp4
Requer: pip install av faster-whisper numpy
"""
import fractions
import json
import re
import sys
import unicodedata
from difflib import SequenceMatcher

import av
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
FPS = 30
SR = 48000
SRC = sys.argv[1]
DRY = "--dry-run" in sys.argv

# parâmetros do estilo (medidos no vídeo aprovado)
PAD_BEFORE = 0.05  # respiro antes de uma palavra após um corte
PAD_AFTER = 0.08  # respiro depois da última palavra antes de um corte
MAX_GAP_MID = 0.15  # pausa máxima mantida dentro da frase
MAX_GAP_END = 0.30  # pausa máxima mantida em fim de frase (. ? !)
TAIL = 0.35  # sobra no fim do vídeo
RETAKE_WINDOW = 15.0  # s: janela para procurar a repetição de uma frase
FADE = 0.006  # s de fade de áudio em cada emenda

# ------------------------------------------------------------------ áudio (48 kHz estéreo)
print("1/5 lendo áudio…")
c = av.open(SRC)
res = av.AudioResampler(format="fltp", layout="stereo", rate=SR)
chunks = []
for fr in c.decode(audio=0):
    for x in res.resample(fr):
        chunks.append(x.to_ndarray())
audio = np.concatenate(chunks, 1).astype(np.float32)  # (2, n)
mono = audio.mean(0)
dur = audio.shape[1] / SR

# energia em janelas de 10 ms
hop = SR // 100
nwin = len(mono) // hop
energy = np.sqrt((mono[: nwin * hop].reshape(nwin, hop) ** 2).mean(1))
db = 20 * np.log10(energy + 1e-9)
floor, peak = np.percentile(db, 10), np.percentile(db, 97)
speech_thr = floor + 0.30 * (peak - floor)
print(f"   duração {dur:.1f} s | ruído {floor:.1f} dB | fala {peak:.1f} dB | limiar {speech_thr:.1f} dB")


# ilhas de fala medidas no áudio (janelas acima do limiar, unindo buracos < 120 ms, descartando < 60 ms)
above = db > speech_thr
islands, i = [], 0
while i < nwin:
    if above[i]:
        j = i
        while j < nwin and above[j]:
            j += 1
        if islands and i - islands[-1][1] < 12:
            islands[-1][1] = j
        else:
            islands.append([i, j])
        i = j
    else:
        i += 1
islands = [(a / 100, b / 100) for a, b in islands if b - a >= 6]


def onset(t):
    """Início real da palavra: se t cai no silêncio (timestamp do Whisper adiantado), pula para a
    próxima ilha de fala (até 0,8 s); se cai no começo de uma ilha, usa o início da ilha."""
    for a, b in islands:
        if a <= t < b:
            return a if t - a < 0.25 else t
        if t < a <= t + 0.8:
            return a
    return t


def offset(t):
    """Fim real da palavra: fim da ilha que contém t (até 0,25 s depois), senão t."""
    for a, b in islands:
        if a <= t <= b:
            return b if b - t < 0.25 else t
        if t < a:
            break
    return t


def voiced(s, e):
    """Fração do intervalo com energia de fala — descarta 'palavras' alucinadas no silêncio."""
    a, b = int(s * 100), max(int(s * 100) + 1, int(e * 100))
    return above[a:b].mean() if b <= nwin else 0.0


# ------------------------------------------------------------------ transcrição
print("2/5 transcrevendo (faster-whisper medium)…")
from faster_whisper import WhisperModel

model = WhisperModel("medium", device="cpu", compute_type="int8")
# Transcreve CADA bloco de fala separadamente (blocos separados por pausas ≥ 0,35 s).
# Transcrever o arquivo inteiro faz o Whisper "fundir" tomadas repetidas numa só,
# escondendo exatamente os erros que queremos cortar.
chunks, cur = [], None
for a, b in islands:
    if cur and (a - cur[1] < 0.35 and b - cur[0] < 15):
        cur[1] = b
    else:
        if cur:
            chunks.append(cur)
        cur = [a, b]
if cur:
    chunks.append(cur)
m16 = mono[:: SR // 16000].astype(np.float32)
words = []
for a, b in chunks:
    s0 = max(0.0, a - 0.15)
    piece = m16[int(s0 * 16000) : int((b + 0.15) * 16000)]
    segs, _ = model.transcribe(piece, language="pt", word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
    for sg in segs:
        for w in sg.words:
            ws_, we_ = s0 + w.start, s0 + w.end
            if w.word.strip() and voiced(ws_, we_) > 0.15:
                words.append({"w": w.word.strip(), "s": ws_, "e": we_, "keep": True, "why": ""})
print(f"   {len(chunks)} blocos de fala, {len(words)} palavras")
if not words:
    raise SystemExit("nenhuma fala encontrada")

norm = lambda t: re.sub(r"[^a-z0-9 ]", "", unicodedata.normalize("NFKD", t.lower()).encode("ascii", "ignore").decode())

# ------------------------------------------------------------------ erros: gagueira e retakes
print("3/5 procurando repetições e tomadas abandonadas…")
# a) palavra repetida em sequência ("para para")
for i in range(1, len(words)):
    a, b = words[i - 1], words[i]
    if norm(a["w"]) and norm(a["w"]) == norm(b["w"]) and b["s"] - a["e"] < 0.8 and len(norm(a["w"])) > 1:
        a["keep"], a["why"] = False, "palavra repetida"

# b) retake em cada pausa: se o que vem DEPOIS da pausa recomeça dizendo as últimas palavras de ANTES
#    (a tomada abandonada ou a frase inteira repetida), remove a versão anterior — fica a última.
FILLERS = {"e", "entao", "tipo", "ne", "ah", "eh", "hum", "bom", "assim", "pera", "calma", "de", "novo"}
nw = [norm(w["w"]) for w in words]
breaks = [i for i in range(1, len(words)) if words[i]["s"] - words[i - 1]["e"] >= 0.25]
for bi in breaks:
    A = list(range(max(0, bi - 30), bi))  # índices antes da pausa
    B = list(range(bi, min(len(words), bi + 30)))  # depois da pausa
    while B and nw[B[0]] in FILLERS:
        B = B[1:]
    best = None
    for L in range(min(len(A), len(B), 25), 1, -1):
        head = [nw[k] for k in B[:L]]
        for p0 in range(len(A) - L, -1, -1):
            if len(A) - (p0 + L) > 3:  # a tomada anterior precisa terminar perto da pausa
                break
            cand = [nw[k] for k in A[p0 : p0 + L]]
            # âncora: a tomada anterior começa com a mesma palavra da refeita (não engole palavras boas)
            if cand[0] == head[0] and SequenceMatcher(None, cand, head).ratio() >= 0.8:
                best = p0
                break
        if best is not None:
            break
    if best is not None:
        for k in A[best:]:
            if words[k]["keep"]:
                words[k]["keep"], words[k]["why"] = False, f"retake (refeita em {words[bi]['s']:.1f}s)"

# c) frase inteira repetida mais adiante (até RETAKE_WINDOW), mesmo sem pausa marcada
phrases, cur = [], []
for i, w in enumerate(words):
    cur.append(i)
    nxt = words[i + 1] if i + 1 < len(words) else None
    if nxt is None or nxt["s"] - w["e"] > 0.45 or re.search(r"[.?!]$", w["w"]):
        phrases.append(cur)
        cur = []
ptext = [[nw[i] for i in p if nw[i]] for p in phrases]
for i in range(len(phrases)):
    if len(ptext[i]) < 4 or not all(words[k]["keep"] for k in phrases[i]):
        continue
    t_end = words[phrases[i][-1]]["e"]
    for j in range(i + 1, len(phrases)):
        if words[phrases[j][0]]["s"] - t_end > RETAKE_WINDOW:
            break
        if SequenceMatcher(None, ptext[i], ptext[j]).ratio() >= 0.8:
            for k in phrases[i]:
                words[k]["keep"], words[k]["why"] = False, f"frase repetida (de novo em {words[phrases[j][0]]['s']:.1f}s)"
            break

# ------------------------------------------------------------------ intervalos a manter
print("4/5 montando cortes…")
kept = [w for w in words if w["keep"]]
iv = []  # (ini, fim) em segundos no bruto
prev = None
cut_floor = 0.0  # fim da última palavra removida (o próximo trecho não pode começar antes)
for w in words:
    if not w["keep"]:
        cut_floor = max(cut_floor, w["e"])
        continue
    if prev is None:
        iv.append([onset(w["s"]) - 0.03, offset(w["e"])])  # começa ~1 frame antes da 1ª letra
    else:
        gap = w["s"] - prev["e"]
        limit = MAX_GAP_END if re.search(r"[.?!,]$", prev["w"]) else MAX_GAP_MID
        removed_between = cut_floor > prev["e"]
        if gap <= limit and not removed_between:
            iv[-1][1] = offset(w["e"])  # continua o mesmo trecho
        else:
            # fecha o trecho com um respiro curto e abre o próximo logo antes da palavra
            iv[-1][1] = min(max(prev["e"] + PAD_AFTER, offset(prev["e"])), prev["e"] + 0.2)
            iv.append([max(onset(w["s"]) - PAD_BEFORE, cut_floor, iv[-1][1]), offset(w["e"])])
    prev = w
iv[-1][1] = min(dur, iv[-1][1] + TAIL)
# alinha a frames de 30 FPS
snap = lambda t: round(t * FPS) / FPS
iv = [[snap(max(0, a)), snap(min(dur, b))] for a, b in iv]
merged = []
for a, b in iv:
    if merged and a <= merged[-1][1] + 1e-6:
        merged[-1][1] = max(merged[-1][1], b)
    elif b - a >= 2 / FPS:
        merged.append([a, b])
iv = merged
out_dur = sum(b - a for a, b in iv)

# relatório
removed = [w for w in words if not w["keep"]]
lines = [
    f"Bruto: {dur:.2f} s → cortado: {out_dur:.2f} s ({len(iv)} trechos, {len(iv)-1} cortes)",
    f"Início: fala começa em {iv[0][0]:.2f} s do bruto (silêncio inicial removido)",
    "",
    "Palavras removidas:",
]
lines += [f"  {w['s']:7.2f}s  {w['w']:<18} {w['why']}" for w in removed] or ["  (nenhuma)"]
lines += ["", "Trechos mantidos (bruto):"] + [f"  {a:7.2f} – {b:7.2f}  ({b-a:.2f}s)" for a, b in iv]
lines += ["", "Texto final:", " ".join(w["w"] for w in kept)]
# "with" garante que os arquivos sejam gravados antes da saída (dry-run sai logo em seguida)
with open("decupagem_bruto.txt", "w", encoding="utf8") as fh:
    fh.write("\n".join(lines) + "\n")
with open("cortes.json", "w", encoding="utf8") as fh:
    json.dump({"source": SRC, "keep": iv,
               "removed": [{k: w[k] for k in ("w", "s", "e", "why")} for w in removed],
               "words": [{"w": w["w"], "s": round(w["s"], 2), "e": round(w["e"], 2), "keep": w["keep"]} for w in words]},
              fh, ensure_ascii=False, indent=1)
print("\n".join(lines[:4 + len(removed)]))
if DRY:
    raise SystemExit("dry-run: veja decupagem_bruto.txt")

# ------------------------------------------------------------------ render do corte
# (separado em render_cut.py para permitir ajuste manual de cortes.json e novo render sem transcrever de novo)
import subprocess
from pathlib import Path

print("5/5 renderizando bruto_cortado.mp4…")
subprocess.run([sys.executable, str(Path(__file__).with_name("render_cut.py"))], check=True)
