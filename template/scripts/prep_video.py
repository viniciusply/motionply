"""
Prepara a gravação do apresentador para o template lapidado.

Uso (dentro da pasta do projeto copiado do template):
    python scripts/prep_video.py "C:/caminho/meu video.MOV"
    python scripts/prep_video.py "gravacao.mp4" --roi=0.6,0.5,1,1   # só rostos dentro da região (frações x0,y0,x1,y1)

Orientação automática: vídeo em pé → 1080x1920; vídeo deitado (gravação de tela, YouTube) → 1920x1080.
--roi serve para gravação de tela com webcam: rastreia o rosto da webcam e ignora rostos que aparecem na tela.

Gera:
  public/video.mp4        H.264 1080x1920 (ou 1920x1080 se deitado) 30 FPS (+ AAC 48 kHz) — o Chrome do Remotion não decodifica HEVC 4K
  src/words.ts            transcrição palavra a palavra (faster-whisper) em frames a 30 FPS
  src/faceTrack.ts        centro/tamanho do rosto por frame (OpenCV YuNet + mediana + média móvel)
  public/img/face*.jpg    12 recortes quadrados do rosto (para cards, clones, avatar)
  transcricao.txt         texto por segmento, para revisar

Depois: confira words.ts (nomes próprios e de marcas costumam sair escritos "como se ouve")
e ajuste FRAMES em src/timeline.ts com o total impresso.
Requer: pip install av faster-whisper opencv-python numpy pillow
"""
import fractions
import json
import os
import sys
import wave

import av
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")  # console do Windows (cp1252) não imprime "→"
FPS = 30
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1]
ROI = next((tuple(map(float, a.split("=", 1)[1].split(","))) for a in sys.argv[2:] if a.startswith("--roi=")), (0, 0, 1, 1))
os.makedirs("public/img", exist_ok=True)
_v = av.open(SRC).streams.video[0]
W, H = (1920, 1080) if _v.width > _v.height else (1080, 1920)  # orientação automática
print(f"saída {W}x{H}")

# ---------------------------------------------------------------- 1. transcode
print("1/4 convertendo vídeo…")
src = av.open(SRC)
vs = src.streams.video[0]
as_ = src.streams.audio[0]
vs.thread_type = "AUTO"
out = av.open("public/video.mp4", "w", options={"movflags": "+faststart"})
ov = out.add_stream("libx264", rate=FPS, options={"crf": "18", "preset": "medium"})
ov.width, ov.height, ov.pix_fmt = W, H, "yuv420p"
oa = out.add_stream("aac", rate=48000)
oa.layout = "stereo"
oa.bit_rate = 192000
res_a = av.AudioResampler(format="fltp", layout="stereo", rate=48000)
res_w = av.AudioResampler(format="s16", layout="mono", rate=16000)
wav = wave.open("audio16k.wav", "wb")
wav.setnchannels(1)
wav.setsampwidth(2)
wav.setframerate(16000)
n = 0
pending = None


def emit(frame):
    global n
    frame.pts = n
    frame.time_base = fractions.Fraction(1, FPS)
    for p in ov.encode(frame):
        out.mux(p)
    n += 1


for packet in src.demux(vs, as_):
    for frame in packet.decode():
        if isinstance(frame, av.VideoFrame):
            if frame.time is None:
                continue
            while pending is not None and n / FPS < frame.time - 1e-6:
                emit(pending)
            pending = frame.reformat(width=W, height=H, format="yuv420p", interpolation="LANCZOS")
        else:
            frame.pts = None
            for f in res_a.resample(frame):
                for p in oa.encode(f):
                    out.mux(p)
            for f in res_w.resample(frame):
                wav.writeframes(f.to_ndarray().tobytes())
dur = float(src.duration) / 1e6
while pending is not None and n / FPS < dur - 1e-6:
    emit(pending)
for p in ov.encode():
    out.mux(p)
for p in oa.encode():
    out.mux(p)
out.close()
wav.close()
FRAMES = n
print(f"   FRAMES = {FRAMES}  ({dur:.2f} s)")

# ---------------------------------------------------------------- 2. transcrição
print("2/4 transcrevendo (faster-whisper medium, CPU)…")
from faster_whisper import WhisperModel

m = WhisperModel("medium", device="cpu", compute_type="int8")
segs, _ = m.transcribe("audio16k.wav", language="pt", word_timestamps=True)
words, lines = [], []
for s in segs:
    lines.append(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
    for w in s.words:
        words.append({"w": w.word.strip(), "s": round(w.start * FPS), "e": round(w.end * FPS)})
open("transcricao.txt", "w", encoding="utf8").write("\n".join(lines) + "\n")
with open("src/words.ts", "w", encoding="utf8") as f:
    f.write("// Gerado por scripts/prep_video.py (faster-whisper, word_timestamps). Frames a 30 FPS.\n")
    f.write("// REVISAR nomes próprios e conferir tempos no áudio.\n")
    f.write("export type W = {w: string; s: number; e: number};\nexport const WORDS: W[] = [\n")
    for x in words:
        f.write(f"  {{w: {json.dumps(x['w'], ensure_ascii=False)}, s: {x['s']}, e: {x['e']}}},\n")
    f.write("];\n")
print("   " + "\n   ".join(lines))

# ---------------------------------------------------------------- 3. face tracking
print("3/4 face tracking…")
import cv2

det = cv2.FaceDetectorYN_create(os.path.join(HERE, "models", "face_detection_yunet_2023mar.onnx"), "", (W // 4, H // 4), 0.6)
raw = []
c = av.open("public/video.mp4")
for i, fr in enumerate(c.decode(video=0)):
    g = cv2.resize(fr.to_ndarray(format="bgr24"), (W // 4, H // 4))
    _, faces = det.detect(g)
    if faces is not None:
        faces = [r for r in faces if ROI[0] <= (r[0] + r[2] / 2) * 4 / W <= ROI[2] and ROI[1] <= (r[1] + r[3] / 2) * 4 / H <= ROI[3]]
    if faces is not None and len(faces):
        x, y, w, h = max(faces, key=lambda r: r[2] * r[3])[:4]
        raw.append((i, (x + w / 2) * 4, (y + h / 2) * 4, w * 4))
ok = len(raw)
if not ok:
    raise SystemExit("nenhum rosto detectado")
idx = np.array([r[0] for r in raw])
med = lambda a: np.array([np.median(a[max(0, k - 7) : k + 8]) for k in range(len(a))])
cx, cy, sz = (med(np.array([r[j] for r in raw])) for j in (1, 2, 3))
full = np.arange(FRAMES)
X, Y, S = (np.interp(full, idx, a) for a in (cx, cy, sz))


def smooth(a, k=15):
    p = np.pad(a, k, mode="edge")
    return np.convolve(p, np.ones(2 * k + 1) / (2 * k + 1), "valid")


X, Y, S = smooth(X), smooth(Y), smooth(S)
with open("src/faceTrack.ts", "w", encoding="utf8") as f:
    f.write(f"// Centro do rosto por frame (coords do vídeo {W}x{H}). Gerado por scripts/prep_video.py.\n")
    f.write("export const FACE: [number, number, number][] = " + json.dumps([[round(a), round(b), round(s)] for a, b, s in zip(X, Y, S)]) + ";\n")
print(f"   rosto detectado em {ok}/{FRAMES} frames; centro y {Y.min():.0f}–{Y.max():.0f}, tamanho {S.min():.0f}–{S.max():.0f}")

# ---------------------------------------------------------------- 4. recortes do rosto
print("4/4 recortes do rosto…")
picks = set(np.linspace(FRAMES * 0.05, FRAMES * 0.95, 12).astype(int))
c = av.open("public/video.mp4")
k = 0
for i, fr in enumerate(c.decode(video=0)):
    if i in picks:
        half = int(S[i] * 0.95)
        x0, y0 = int(np.clip(X[i] - half, 0, W - 2 * half)), int(np.clip(Y[i] - half * 1.05, 0, H - 2 * half))
        fr.to_image().crop((x0, y0, x0 + 2 * half, y0 + 2 * half)).resize((600, 600)).save(f"public/img/face{k}.jpg", quality=90)
        k += 1
os.remove("audio16k.wav")
print("pronto.")
