import type { Block } from "./Type";
import { FRAMES } from "../timeline";

// ROTEIRO da Tipografia Motion (frames a 30 FPS do vídeo-fonte; limites = início de frase).
// Roteiro de DEMONSTRAÇÃO (textos genéricos) — mostra a densidade e a marcação do padrão. Reescreva para cada vídeo.
// Reescreva para cada vídeo novo (tempos do words.ts do seu vídeo).
//   cam   enquadramento (ver camTipo.ts). Alterne aberto ↔ fechado a cada frase.
//   text  bloco tipográfico (ver Type.tsx: *serif* [marcador] _contorno_ ~riscado~)
//   card  "black" | "white": tela tipográfica cheia (esconde o vídeo; a voz continua). 2–4 por vídeo,
//         alternando preto e branco (é a alternância claro/escuro desta modalidade).

export type TBeat = {
  start: number;
  end: number;
  cam?: { zoom?: number; move?: "static" | "pushIn" | "pullOut"; mirror?: boolean; punch?: number[]; track?: boolean };
  text?: Block;
  card?: "black" | "white";
};

export const ROTEIRO: TBeat[] = [
  // gancho → face tracking
  { start: 0, end: 91, cam: { zoom: 1.25, move: "pushIn", track: true, punch: [76] }, text: { lines: ["*sua frase de*", "GANCHO AQUI", "*com uma* [PALAVRA]"] } },
  { start: 91, end: 147, cam: { zoom: 1, mirror: true }, text: { style: "rsvp", lines: ["UMA PALAVRA POR VEZ"] } },
  { start: 147, end: 197, card: "black", text: { pos: "center", lines: ["TÍTULO", "[EM DESTAQUE]", "*com complemento*"] } },
  { start: 197, end: 301, cam: { zoom: 1.15, move: "pushIn" }, text: { lines: ["IDEIA A", "*e a*", "[IDEIA B]"] } },
  { start: 301, end: 479, cam: { zoom: 1, punch: [317] }, text: { align: "left", lines: ["*primeiro*", "PASSO", "*depois o* SEGUNDO"] } },
  { start: 479, end: 583, cam: { zoom: 1.2, mirror: true }, text: { lines: ["*um problema*", "[COMUM]"] } },
  { start: 583, end: 657, card: "white", text: { pos: "center", lines: ["~O JEITO ANTIGO~", "*acabou?*"] } },
  // momento pessoal → face tracking
  { start: 657, end: 773, cam: { zoom: 1.3, track: true, punch: [752] }, text: { lines: ["*olha para o*", "[ROSTO]"] } },
  { start: 773, end: 868, cam: { zoom: 1, move: "pushIn", punch: [809] }, text: { lines: ["VÁRIAS", "[VERSÕES]", "*do mesmo tema*"] } },
  { start: 868, end: 961, cam: { zoom: 1.15, mirror: true }, text: { align: "left", lines: ["UM.", "DOIS.", "[TRÊS.]"] } },
  { start: 961, end: 1017, card: "black", text: { pos: "center", max: 260, lines: ["*isso é*", "IMPACTO"] } },
  { start: 1017, end: 1113, cam: { zoom: 1.25, track: true, punch: [1017] }, text: { lines: ["QUALQUER", "[ÊNFASE]"] } },
  { start: 1113, end: 1249, cam: { zoom: 1, move: "pushIn" }, text: { lines: ["*um*", "RESULTADO", "*que cresce*"] } },
  { start: 1249, end: 1392, cam: { zoom: 1.2, mirror: true, punch: [1310] }, text: { lines: ["*quer o*", "[CHECKLIST]?"] } },
  // CTA → face tracking
  { start: 1392, end: FRAMES, cam: { zoom: 1.2, track: true, punch: [1411] }, text: { lines: ["*comenta*", "[QUERO]"] } },
];
