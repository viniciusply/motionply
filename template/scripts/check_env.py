"""Confere se o computador tem tudo para a skill: python scripts/check_env.py"""
import importlib, shutil, subprocess, sys
sys.stdout.reconfigure(encoding="utf-8")
ok = True
for mod, pip in [("av", "av"), ("faster_whisper", "faster-whisper"), ("cv2", "opencv-python"), ("numpy", "numpy"), ("PIL", "pillow"), ("scipy", "scipy")]:
    try:
        importlib.import_module(mod)
        print(f"✓ {pip}")
    except Exception:
        ok = False
        print(f"✗ {pip}  →  pip install {pip}")
try:
    import cv2
    assert hasattr(cv2, "FaceDetectorYN")
    print("✓ OpenCV com FaceDetectorYN")
except Exception:
    ok = False
    print("✗ OpenCV sem FaceDetectorYN  →  pip install -U opencv-python")
node = shutil.which("node")
print(("✓ node " + subprocess.run(["node", "-v"], capture_output=True, text=True).stdout.strip()) if node else "✗ Node.js (instale a versão LTS)")
ok = ok and bool(node)
print("\nTudo pronto." if ok else "\nInstale o que falta (pip install -r scripts/requirements.txt) e rode de novo.")
