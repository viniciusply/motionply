"""
Prepara um vídeo adicional (comercial/B-roll) para alternar com o rosto.

Uso:  python scripts/prep_broll.py "C:/caminho/comercial.MP4" [nome_saida]
Gera public/<nome_saida>.mp4 (padrão: comercial.mp4): H.264, 30 FPS, SEM áudio,
com as tarjas pretas (letterbox) removidas automaticamente, e um contact sheet
broll_sheet.jpg (1 quadro a cada 2 s com o tempo) para escolher os trechos.
"""
import fractions
import sys

import av
import numpy as np
from PIL import Image, ImageDraw

sys.stdout.reconfigure(encoding="utf-8")  # console do Windows (cp1252) não imprime "→"
FPS = 30
SRC = sys.argv[1]
NAME = sys.argv[2] if len(sys.argv) > 2 else "comercial"

# detecta letterbox numa amostra de quadros
c = av.open(SRC)
samples = []
for i, fr in enumerate(c.decode(video=0)):
    if i % 30:
        continue
    samples.append(fr.to_ndarray(format="gray").mean(1))
    if i > 30 * 60:
        break
# linha é tarja se fica preta em >= 35% dos quadros (há vídeos que misturam cenas com tarja e telas sem tarja)
black_frac = (np.array(samples) < 12).mean(0)
lit = np.where(black_frac < 0.35)[0]
top, bot = int(lit[0]), int(lit[-1]) + 1
top += top % 2
bot -= (bot - top) % 2
c = av.open(SRC)
W = c.streams.video[0].width
H = bot - top
print(f"recorte vertical {top}–{bot} → {W}x{H}")

src = av.open(SRC)
vs = src.streams.video[0]
vs.thread_type = "AUTO"
out = av.open(f"public/{NAME}.mp4", "w", options={"movflags": "+faststart"})
ov = out.add_stream("libx264", rate=FPS, options={"crf": "18", "preset": "medium"})
ov.width, ov.height, ov.pix_fmt = W, H, "yuv420p"
n, pending, sheet, nxt = 0, None, [], 0.0


def emit(img):
    global n
    fr = av.VideoFrame.from_ndarray(img, format="rgb24").reformat(format="yuv420p")
    fr.pts, fr.time_base = n, fractions.Fraction(1, FPS)
    for p in ov.encode(fr):
        out.mux(p)
    n += 1


for fr in src.decode(vs):
    while pending is not None and n / FPS < fr.time - 1e-6:
        emit(pending)
    pending = fr.to_ndarray(format="rgb24")[top:bot]
    if fr.time >= nxt:
        im = Image.fromarray(pending).resize((320, int(320 * H / W)))
        d = ImageDraw.Draw(im)
        d.rectangle((0, 0, 70, 16), fill="black")
        d.text((3, 2), f"{fr.time:.0f}s f{int(fr.time*FPS)}", fill="white")
        sheet.append(im)
        nxt += 2
dur = float(src.duration) / 1e6
while n / FPS < dur - 1e-6:
    emit(pending)
for p in ov.encode():
    out.mux(p)
out.close()
cols = 8
h = sheet[0].height
S = Image.new("RGB", (320 * cols, h * ((len(sheet) + cols - 1) // cols)))
for i, im in enumerate(sheet):
    S.paste(im, ((i % cols) * 320, (i // cols) * h))
S.save("broll_sheet.jpg", quality=85)
print(f"public/{NAME}.mp4: {n} frames ({dur:.1f} s), {W}x{H}. Contact sheet: broll_sheet.jpg (f = frame a 30 FPS para startFrom)")
