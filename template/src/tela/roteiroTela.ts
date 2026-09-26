import type { Block } from "../tipo/Type";
import { FRAMES } from "../timeline";

// ROTEIRO da Tipografia Motion HORIZONTAL (gravação de tela 16:9 com webcam).
// Frames a 30 FPS do vídeo-fonte; limites = início de frase (words.ts).
//   shot   o que a câmera mostra (regiões rastreadas por scripts/track_tela.py):
//          "wide" = tudo | "AB" = os dois conteúdos | "A" = conteúdo da esquerda |
//          "B" = conteúdo da direita | "CAM" = webcam do apresentador
//   zoom   fator relativo ao padrão do shot (1 = padrão)
//   move   "pushIn" | "pullOut" (aproxima/afasta devagar durante o beat)
//   track  segue o rosto da webcam (face tracking) — só em momentos de atenção (2–5 por vídeo)
//   mirror espelha — SÓ em shot "CAM" (espelhar tela gravada inverte textos de interface)
//   side   onde fica o texto: "left" | "right" | "bottom" (o assunto vai para o lado oposto)
//   card   "black" | "white": tela tipográfica cheia (esconde o vídeo; a voz continua)

export type Shot = "wide" | "AB" | "A" | "B" | "CAM";
export type TelaBeat = {
  start: number;
  end: number;
  shot?: Shot;
  zoom?: number;
  move?: "pushIn" | "pullOut";
  track?: boolean;
  mirror?: boolean;
  punch?: number[];
  side?: "left" | "right" | "bottom";
  text?: Block;
  card?: "black" | "white";
};

// Roteiro de DEMONSTRAÇÃO (textos genéricos): A = conteúdo da esquerda, B = da direita, CAM = webcam.
// Versão "dinâmica" (um enquadramento por frase). Para uma versão calma, use só "wide" e "CAM".
export const ROTEIRO_TELA: TelaBeat[] = [
  { start: 0, end: 73, shot: "CAM", track: true, move: "pushIn", side: "left", text: { align: "left", lines: ["SEU GANCHO", "*aqui*"] } },
  { start: 73, end: 140, shot: "B", side: "left", punch: [107], text: { align: "left", lines: ["*o conteúdo da*", "[DIREITA]"] } },
  { start: 140, end: 210, shot: "B", zoom: 1.12, move: "pushIn", side: "left", text: { align: "left", lines: ["*um detalhe*", "IMPORTANTE"] } },
  { start: 210, end: 331, shot: "A", side: "right", text: { align: "left", lines: ["*o da esquerda:*", "OUTRO", "*com* [DESTAQUE]"] } },
  { start: 331, end: 405, shot: "AB", side: "bottom", text: { lines: ["*compare os* DOIS LADOS"] } },
  { start: 405, end: 487, shot: "B", zoom: 1.1, punch: [439], side: "left", text: { align: "left", lines: ["*aqui ainda*", "~NÃO TEM~"] } },
  { start: 487, end: 611, card: "black", text: { pos: "center", lines: ["*não tem*", "~ITEM UM~ ~ITEM DOIS~", "~ITEM TRÊS~"] } },
  { start: 611, end: 661, shot: "CAM", track: true, punch: [622], side: "left", text: { align: "left", lines: ["ÊNFASE", "[FORTE]"] } },
  { start: 661, end: 740, shot: "B", move: "pullOut", side: "left", text: { align: "left", lines: ["*voltando para*", "A TELA"] } },
  { start: 740, end: 859, shot: "CAM", zoom: 0.9, mirror: true, side: "left", text: { align: "left", lines: ["*explicação*", "*com a*", "[WEBCAM]"] } },
  { start: 859, end: 959, card: "white", text: { pos: "center", lines: ["*a ideia*", "PRINCIPAL", "[AQUI]"] } },
  { start: 959, end: 1060, shot: "A", move: "pushIn", side: "right", text: { align: "left", lines: ["*agora, o da esquerda:*", "A [DIFERENÇA]"] } },
  { start: 1060, end: 1116, shot: "CAM", track: true, punch: [1067], side: "left", text: { align: "left", lines: ["OLHA *o que*", "[ACONTECE]"] } },
  { start: 1116, end: 1231, shot: "A", zoom: 1.1, side: "right", text: { align: "left", lines: ["UM", "DOIS", "[TRÊS]"] } },
  { start: 1231, end: 1311, shot: "A", move: "pullOut", side: "right", text: { align: "left", lines: ["*ênfase em*", "CADA FRASE"] } },
  { start: 1311, end: 1387, card: "black", text: { pos: "center", lines: ["FORMATO A", "*e*", "[FORMATO B]"] } },
  { start: 1387, end: 1513, shot: "AB", side: "bottom", text: { lines: ["*muito mais* [DINÂMICO]"] } },
  { start: 1513, end: 1616, shot: "A", zoom: 1.12, side: "right", text: { align: "left", lines: ["*detalhe sobre*", "O ASSUNTO"] } },
  { start: 1616, end: 1704, shot: "CAM", track: true, move: "pushIn", side: "left", text: { align: "left", lines: ["*pra sua*", "EMPRESA", "*pro seu* [NEGÓCIO]"] } },
  { start: 1704, end: FRAMES, card: "white", text: { pos: "center", lines: ["*frase de*", "[FECHAMENTO]"] } },
];
