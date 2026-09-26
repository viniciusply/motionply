import { es } from "./ui";
import { FACE } from "./faceTrack";
import { FRAMES, Mode, PUNCH, SPLIT, TIMELINE } from "./timeline";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const amount = (f: number, test: (b: (typeof TIMELINE)[number]) => boolean) => {
  let v = 0;
  for (const b of TIMELINE) {
    if (!test(b)) continue;
    const inn = b.start === 0 ? 1 : es(f, b.start - 6, b.start + 7);
    const out = b.end >= FRAMES ? 0 : es(f, b.end - 7, b.end + 6);
    v = Math.max(v, Math.min(inn, 1 - out));
  }
  return v;
};
const mode = (m: Mode) => (b: (typeof TIMELINE)[number]) => b.mode === m;

/**
 * Câmera virtual sobre o vídeo master: segue o rosto (face tracking suavizado),
 * aplica zooms de ênfase e muda o enquadramento entre os modos.
 */
export const camera = (f: number) => {
  const full = amount(f, mode("full"));
  const face = amount(f, mode("face"));
  const cam = amount(f, mode("cam"));
  const light = amount(f, (b) => !!b.light);
  const open = Math.min(1, face + cam); // vídeo ocupa a tela inteira
  const winTop = lerp(SPLIT, 0, open);
  const panelY = full * (1920 - winTop + 40);
  const intro = 0.28 * (1 - es(f, 0, 22)); // abertura: começa colado no rosto e abre
  const punch = PUNCH.reduce((acc, p) => acc + p.amt * (es(f, p.at - 3, p.at + 8) - es(f, p.at + p.hold, p.at + p.hold + 12)), 0);
  const s = lerp(1, 1.1, face) + punch + intro;
  const [fx, fy, fsz] = FACE[Math.min(FACE.length - 1, Math.max(0, Math.round(f)))];
  const tx = 540;
  const ty = lerp(lerp(1460, 820, face), fy, cam); // cam: enquadramento natural (Y≈0)
  const gap = face * 440; // no modo rosto, a base vira degradê do overlay
  let X = tx - fx * s;
  let Y = ty - fy * s;
  X = Math.min(0, Math.max(1080 - 1080 * s, X));
  Y = Math.min(winTop, Math.max(1920 - gap - 1920 * s, Y));
  return {
    full,
    face,
    cam,
    open,
    light,
    // posições inteiras: evita a linha de 1 px na borda da janela durante as transições
    winTop: Math.round(winTop),
    panelY: Math.round(panelY),
    s,
    X: Math.round(X),
    Y: Math.round(Y),
    /** rosto em coordenadas de tela */
    faceScreen: { x: X + fx * s, y: Y + fy * s + panelY, size: fsz * s },
  };
};
