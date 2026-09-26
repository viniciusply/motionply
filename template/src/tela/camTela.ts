import { e, es } from "../ui";
import { A, B, CAM, VH, VW } from "./layout";
import { ROTEIRO_TELA, Shot, TelaBeat } from "./roteiroTela";

// Câmera virtual da Tipografia Motion HORIZONTAL (gravação de tela 16:9).
// Cada beat enquadra uma REGIÃO rastreada (os rostos A, B e CAM de layout.ts), então o
// enquadramento continua certo mesmo quando a gravação dá zoom ou as janelas mudam de lugar.
// Sem `track`, a âncora é a posição no 1º frame do beat e fica parada; com `track`, segue o rosto.

type P3 = [number, number, number];
const at = (arr: P3[], f: number) => arr[Math.min(arr.length - 1, Math.max(0, Math.round(f)))];
const avg = (arr: P3[], f: number) => {
  // média de ±6 frames para o tracking não tremer
  let x = 0;
  let y = 0;
  let n = 0;
  for (let d = -6; d <= 6; d++) {
    const [fx, fy] = at(arr, f + d);
    x += fx;
    y += fy;
    n++;
  }
  return [x / n, y / n] as const;
};

// ponto-alvo (coordenadas do vídeo) e escala de cada shot. Nos closes a escala vem do TAMANHO do rosto
// (rosto com ~FACE_PX na tela), não de um fator fixo — se a gravação já deu zoom, a câmera aproxima menos
// e a imagem não fica borrada. Teto MAX_S: acima disso a gravação (geralmente 1080p) perde nitidez.
const FACE_PX = { A: 360, B: 360, CAM: 300 };
const MAX_S = 2.4;
const fit = (px: number, size: number) => Math.min(MAX_S, Math.max(1, px / Math.max(1, size)));
const shotPoint = (shot: Shot, f: number): [number, number, number] => {
  const [ax, ay, as] = at(A, f);
  const [bx, by, bs] = at(B, f);
  const [cx, cy, cs] = at(CAM, f);
  switch (shot) {
    case "A":
      return [ax, ay + as * 0.35, fit(FACE_PX.A, as)];
    case "B":
      return [bx, by + bs * 0.35, fit(FACE_PX.B, bs)];
    case "AB":
      return [(ax + bx) / 2, (ay + by) / 2 + 60, 1.4];
    case "CAM":
      return [cx, cy, fit(FACE_PX.CAM, cs)];
    default:
      return [(ax + cx) / 2, VH / 2, 1.2];
  }
};

// onde o assunto fica na tela, conforme o lado do texto
const screenPoint = (b: TelaBeat): [number, number] =>
  b.side === "left" ? [VW * 0.7, VH * 0.5] : b.side === "right" ? [VW * 0.3, VH * 0.5] : b.side === "bottom" ? [VW * 0.5, VH * 0.4] : [VW / 2, VH / 2];

export const telaBeatAt = (f: number): TelaBeat => ROTEIRO_TELA.find((b) => f >= b.start && f < b.end) ?? ROTEIRO_TELA[ROTEIRO_TELA.length - 1];

export const camTela = (f: number) => {
  const b = telaBeatAt(f);
  const shot = b.shot ?? "wide";
  const [px0, py0, s0] = shotPoint(shot, b.start);
  let [px, py] = [px0, py0];
  if (b.track && shot === "CAM") [px, py] = avg(CAM, f);
  const local = (f - b.start) / Math.max(1, b.end - b.start);
  let s = s0 * (b.zoom ?? 1);
  if (b.move === "pushIn") s *= 1 + 0.12 * es(local, 0, 1);
  if (b.move === "pullOut") s *= 1 + 0.12 * (1 - es(local, 0, 1));
  s *= 1 + 0.04 * (1 - e(f, b.start, b.start + 6)) * (b.start > 0 ? 1 : 0); // energia no corte
  for (const p of b.punch ?? []) s *= 1 + 0.14 * (es(f, p - 2, p + 3) - es(f, p + 12, p + 22));
  if (b.start === 0) s *= 1 + 0.2 * (1 - es(f, 0, 20)); // abertura
  s = Math.min(s, MAX_S * 1.15); // movimentos e socos podem passar um pouco do teto
  const [sx, sy] = screenPoint(b);
  let X = sx - px * s;
  let Y = sy - py * s;
  X = Math.min(0, Math.max(VW - VW * s, X));
  Y = Math.min(0, Math.max(VH - VH * s, Y));
  return { s, X: Math.round(X), Y: Math.round(Y), mirror: !!b.mirror && shot === "CAM", beat: b };
};
