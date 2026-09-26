"""
Rastreia as REGIÕES de uma gravação de tela 16:9 (para a Tipografia Motion horizontal).

Uso (depois do prep_video.py):  python scripts/track_tela.py
Gera src/tela/layout.ts com, por frame, o centro e o tamanho de 3 rostos:
  A = rosto mais à esquerda na tela (ex.: vídeo da esquerda)
  B = segundo rosto na tela        (ex.: vídeo da direita)
  CAM = webcam do apresentador      (rosto mais abaixo e à direita — a bolha da câmera)
Como a gravação costuma dar zoom e mover janelas, a câmera virtual segue essas
posições em vez de usar coordenadas fixas. Frames sem rosto são interpolados.
Requer: opencv-python (YuNet em scripts/models).
"""
import json
import os
import sys

import av
import cv2
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
c = av.open("public/video.mp4")
vs = c.streams.video[0]
W, H = vs.width, vs.height
K = 2  # detecta em meia resolução (a webcam é pequena)
det = cv2.FaceDetectorYN_create(os.path.join(HERE, "models", "face_detection_yunet_2023mar.onnx"), "", (W // K, H // K), 0.6)

tracks = {"A": [], "B": [], "CAM": []}  # (frame, x, y, size)
n = 0
for i, fr in enumerate(c.decode(video=0)):
    n += 1
    g = cv2.resize(fr.to_ndarray(format="bgr24"), (W // K, H // K))
    _, faces = det.detect(g)
    if faces is None:
        continue
    fs = [((x + w / 2) * K, (y + h / 2) * K, w * K) for x, y, w, h in (r[:4] for r in faces)]
    # webcam: o rosto mais abaixo-à-direita (maior x/W + y/H), se estiver na metade de baixo
    cam = max(fs, key=lambda t: t[0] / W + t[1] / H)
    if cam[1] > H * 0.5 and cam[0] > W * 0.5:
        tracks["CAM"].append((i, *cam))
        fs.remove(cam)
    fs.sort(key=lambda t: t[0])
    if len(fs) >= 2:
        tracks["A"].append((i, *fs[0]))
        tracks["B"].append((i, *fs[1]))
    elif len(fs) == 1:
        tracks["A" if fs[0][0] < W * 0.43 else "B"].append((i, *fs[0]))

out = {}
full = np.arange(n)
med = lambda a: np.array([np.median(a[max(0, k - 7) : k + 8]) for k in range(len(a))])


def smooth(a, k=12):
    p = np.pad(a, k, mode="edge")
    return np.convolve(p, np.ones(2 * k + 1) / (2 * k + 1), "valid")


for name, t in tracks.items():
    if not t:
        out[name] = [[W // 2, H // 2, 200]] * n
        print(f"   {name}: nenhum rosto — usando o centro")
        continue
    idx = np.array([r[0] for r in t])
    cols = [smooth(np.interp(full, idx, med(np.array([r[j] for r in t])))) for j in (1, 2, 3)]
    out[name] = [[round(a), round(b), round(s)] for a, b, s in zip(*cols)]
    print(f"   {name}: {len(t)}/{n} frames; x {cols[0].min():.0f}–{cols[0].max():.0f}, y {cols[1].min():.0f}–{cols[1].max():.0f}, tam {cols[2].min():.0f}–{cols[2].max():.0f}")

os.makedirs("src/tela", exist_ok=True)
with open("src/tela/layout.ts", "w", encoding="utf8") as f:
    f.write(f"// Gerado por scripts/track_tela.py — centro/tamanho de rostos por frame (vídeo {W}x{H}).\n")
    f.write(f"export const VW = {W};\nexport const VH = {H};\n")
    for name in ("A", "B", "CAM"):
        f.write(f"export const {name}: [number, number, number][] = {json.dumps(out[name])};\n")
print("pronto: src/tela/layout.ts")
