import { e, es } from "../ui";
import { FACE } from "../faceTrack";
import { ROTEIRO, TBeat } from "./roteiro";

// Câmera da Tipografia Motion: o vídeo ocupa a tela inteira o tempo todo e o
// ritmo vem de CORTES DE ENQUADRAMENTO entre frases (jump cuts):
//   zoom      enquadramento do beat (1 = aberto; 1.15–1.4 = fechado)
//   move      "static" | "pushIn" (aproxima devagar) | "pullOut" (afasta devagar)
//   mirror    espelha o vídeo (corte seco) — o texto nunca espelha
//   punch     frames de "soco" de zoom (+14%) em palavras de ênfase
//   track     face tracking: a câmera SEGUE o rosto. Só em momentos de atenção
//             (gancho, revelação, CTA) — 2 a 5 por vídeo, nunca no vídeo todo.
// Sem track, o zoom é ancorado no rosto do 1º frame do beat e fica parado.

const FACE_TARGET: [number, number] = [540, 1200]; // onde o rosto fica na tela quando rastreado

const faceAt = (f: number) => FACE[Math.min(FACE.length - 1, Math.max(0, Math.round(f)))];

// rosto suavizado (média de ±6 frames) para o tracking não tremer
const smoothFace = (f: number) => {
  let x = 0;
  let y = 0;
  let n = 0;
  for (let d = -6; d <= 6; d++) {
    const [fx, fy] = faceAt(f + d);
    x += fx;
    y += fy;
    n++;
  }
  return [x / n, y / n] as const;
};

export const beatAt = (f: number): TBeat | undefined => ROTEIRO.find((b) => f >= b.start && f < b.end);

export const camTipo = (f: number) => {
  const b = beatAt(f) ?? ROTEIRO[ROTEIRO.length - 1];
  const c = b.cam ?? {};
  const z0 = c.zoom ?? 1;
  const local = (f - b.start) / Math.max(1, b.end - b.start);
  let s = z0;
  if (c.move === "pushIn") s = z0 + 0.14 * es(local, 0, 1);
  if (c.move === "pullOut") s = z0 + 0.14 * (1 - es(local, 0, 1));
  // energia no corte: entra 4% mais perto e assenta em 6 frames
  s += 0.04 * (1 - e(f, b.start, b.start + 6)) * (b.start > 0 ? 1 : 0);
  for (const p of c.punch ?? []) s += 0.14 * (es(f, p - 2, p + 3) - es(f, p + 12, p + 22));
  if (b.start === 0) s += 0.22 * (1 - es(f, 0, 20)); // abertura: começa colado e abre

  let X: number;
  let Y: number;
  if (c.track) {
    const [fx, fy] = smoothFace(f);
    X = FACE_TARGET[0] - fx * s;
    Y = FACE_TARGET[1] - fy * s;
  } else {
    const [ax, ay] = faceAt(b.start); // âncora fixa: zoom em direção ao rosto, sem seguir
    X = ax - ax * s;
    Y = ay - ay * s;
  }
  X = Math.min(0, Math.max(1080 - 1080 * s, X));
  Y = Math.min(0, Math.max(1920 - 1920 * s, Y));
  return { s, X: Math.round(X), Y: Math.round(Y), mirror: !!c.mirror, beat: b };
};
