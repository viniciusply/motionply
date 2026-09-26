"""
Renderiza bruto_cortado.mp4 a partir de cortes.json (gerado por rough_cut.py).

Uso:  python scripts/render_cut.py
Permite ajustar os trechos à mão antes do render: edite "keep" em cortes.json
(pares [início, fim] em segundos do bruto; "words" traz o tempo de cada palavra)
— ex.: remover um falso começo que o detector automático não pegou.
"""
import fractions
import json
import sys

import av
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
FPS = 30
SR = 48000
FADE = 0.006  # s de fade de áudio em cada emenda

cfg = json.load(open("cortes.json", encoding="utf8"))
SRC = cfg["source"]
_v = av.open(SRC).streams.video[0]
W, H = (1920, 1080) if _v.width > _v.height else (1080, 1920)  # orientação automática
snap = lambda t: round(t * FPS) / FPS
iv = [[snap(a), snap(b)] for a, b in cfg["keep"]]
out_dur = sum(b - a for a, b in iv)

c = av.open(SRC)
res = av.AudioResampler(format="fltp", layout="stereo", rate=SR)
chunks = [x.to_ndarray() for fr in c.decode(audio=0) for x in res.resample(fr)]
audio = np.concatenate(chunks, 1).astype(np.float32)

# áudio: concatena trechos com micro-fade
nf = int(FADE * SR)
ramp = np.linspace(0, 1, nf, dtype=np.float32)
parts = []
for a, b in iv:
    seg = audio[:, int(a * SR) : int(b * SR)].copy()
    if seg.shape[1] > 2 * nf:
        seg[:, :nf] *= ramp
        seg[:, -nf:] *= ramp[::-1]
    parts.append(seg)
out_audio = np.concatenate(parts, 1)

# vídeo: para cada frame de saída, o frame do bruto no instante mapeado
starts = np.cumsum([0] + [b - a for a, b in iv])
n_out = int(round(out_dur * FPS))
src_times = []
for n in range(n_out):
    t = n / FPS
    k = min(len(iv) - 1, int(np.searchsorted(starts, t, side="right") - 1))
    src_times.append(iv[k][0] + (t - starts[k]))

src = av.open(SRC)
vs = src.streams.video[0]
vs.thread_type = "AUTO"
out = av.open("bruto_cortado.mp4", "w", options={"movflags": "+faststart"})
ov = out.add_stream("libx264", rate=FPS, options={"crf": "16", "preset": "medium"})
ov.width, ov.height, ov.pix_fmt = W, H, "yuv420p"
oa = out.add_stream("aac", rate=SR)
oa.layout = "stereo"
oa.bit_rate = 192000


def emit(fr, n):
    o = fr.reformat(width=W, height=H, format="yuv420p", interpolation="LANCZOS")
    o.pts, o.time_base = n, fractions.Fraction(1, FPS)
    for p in ov.encode(o):
        out.mux(p)


n = 0
last = None
for fr in src.decode(vs):
    t = fr.time
    if t is None:
        continue
    # emite todos os frames de saída cujo instante-fonte já passou
    while n < n_out and src_times[n] < t - 0.5 / FPS and last is not None:
        emit(last, n)
        n += 1
    last = fr
    if n >= n_out:
        break
while n < n_out and last is not None:
    emit(last, n)
    n += 1
for p in ov.encode():
    out.mux(p)
step = 1024
for i in range(0, out_audio.shape[1], step):
    af = av.AudioFrame.from_ndarray(np.ascontiguousarray(out_audio[:, i : i + step]), format="fltp", layout="stereo")
    af.sample_rate = SR
    af.pts = i
    for p in oa.encode(af):
        out.mux(p)
for p in oa.encode():
    out.mux(p)
out.close()
print(f"pronto: bruto_cortado.mp4 ({n} frames, {out_audio.shape[1]/SR:.2f} s, {len(iv)} trechos)")
