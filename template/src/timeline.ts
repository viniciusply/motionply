// Tempos dos beats (frames a 30 FPS, limites = palavras reais do words.ts). [start, end)
//  split = ilustração em cima + rosto embaixo
//  full  = tela cheia editorial (rosto sai de cena; voz continua)
//  face  = rosto 100% na tela com animação em overlay na parte de baixo
//  cam   = gravação 100% na tela, sem degradê (pop-ups sobre o vídeo)
//  light = tema claro (fundo branco, detalhes azul-escuro/preto)
import { CONFIG } from "./config";

export const FPS = 30;
export const FRAMES = 1449; // duração do vídeo-fonte em frames (todos os tempos abaixo estão nessa base)
export const SPEED = CONFIG.SPEED;
/** duração do render final após a velocidade */
export const OUT_FRAMES = Math.ceil(FRAMES / SPEED);
/** frame do vídeo-fonte → frame da composição final (para <Sequence from>) */
export const toOut = (fr: number) => Math.round(fr / SPEED);
export const SPLIT = 860;

export type Mode = "split" | "full" | "face" | "cam";
export type Dir = "left" | "right" | "up" | "down";
export const TIMELINE: { id: string; start: number; end: number; mode: Mode; dir: Dir; light?: boolean }[] = [
  { id: "hook", start: 0, end: 91, mode: "face", dir: "up" },
  { id: "titulo", start: 91, end: 197, mode: "full", dir: "up", light: true },
  { id: "duo", start: 197, end: 301, mode: "split", dir: "right" },
  { id: "prompt", start: 301, end: 479, mode: "split", dir: "left", light: true },
  { id: "contador", start: 479, end: 657, mode: "full", dir: "up" },
  { id: "identidade", start: 657, end: 773, mode: "face", dir: "up" },
  { id: "grade", start: 773, end: 868, mode: "split", dir: "left" },
  { id: "pipeline", start: 868, end: 961, mode: "split", dir: "right" },
  { id: "impacto", start: 961, end: 1017, mode: "full", dir: "down" },
  { id: "enfase", start: 1017, end: 1113, mode: "face", dir: "up" },
  { id: "dashboard", start: 1113, end: 1249, mode: "split", dir: "right", light: true },
  { id: "checklist", start: 1249, end: 1392, mode: "split", dir: "left" },
  { id: "cta", start: 1392, end: FRAMES, mode: "cam", dir: "up" },
];

/** Face tracking: zoom que puxa a atenção para o rosto na palavra-chave. */
export const PUNCH: { at: number; hold: number; amt: number }[] = [
  { at: 76, hold: 10, amt: 0.08 }, // palavra de ênfase
  { at: 317, hold: 28, amt: 0.12 }, // palavra de ênfase
  { at: 752, hold: 16, amt: 0.16 }, // palavra de ênfase
  { at: 809, hold: 24, amt: 0.1 }, // palavra de ênfase
  { at: 1017, hold: 24, amt: 0.16 }, // palavra de ênfase
  { at: 1255, hold: 18, amt: 0.1 }, // palavra de ênfase
  { at: 1310, hold: 22, amt: 0.1 }, // palavra de ênfase
  { at: 1392, hold: 60, amt: 0.1 }, // palavra de ênfase
];
