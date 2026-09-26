import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { e, ei } from "../ui";
import { FRAMES, SPEED } from "../timeline";
import { camTipo } from "./camTipo";
import { SANS, TypeBlock } from "./Type";

// Modalidade TIPOGRAFIA MOTION: vídeo em tela cheia + tipografia editorial,
// zoom in/out, espelhamento, socos de zoom e face tracking pontual.
// Sem ilustrações, gráficos ou imagens. Roteiro em ./roteiro.ts.

export const TipoVideo: React.FC = () => {
  const f = useCurrentFrame() * SPEED; // motion no tempo do vídeo-fonte
  const cam = camTipo(f);
  const b = cam.beat;
  const card = b.card;
  // cartão claro em branco suavizado + tinta quase-preta (HIG: evitar branco "brilhando" em contexto escuro)
  const ink = card === "white" ? "#1D1D1F" : "#fff";
  const paper = card === "white" ? "#F5F5F7" : "#000";
  // cartão entra com leve "respiro" de escala (corte seco, sem flash)
  const cardPop = card ? 1.04 - 0.04 * e(f, b.start, b.start + 7) : 1;
  const textTop = !card && b.text && b.text.pos !== "center";
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: SANS }}>
      {/* vídeo master contínuo (a voz nunca reinicia); espelhamento só na imagem */}
      <AbsoluteFill style={{ transform: cam.mirror ? "scaleX(-1)" : undefined }}>
        <OffthreadVideo
          src={staticFile("video.mp4")}
          playbackRate={SPEED}
          style={{ position: "absolute", left: cam.X, top: cam.Y, width: 1080 * cam.s, height: 1920 * cam.s }}
        />
      </AbsoluteFill>
      {/* véu no topo para leitura do texto sobre o vídeo */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 1000,
          background: "linear-gradient(180deg, #000000b0 0%, #00000070 45%, #0000 100%)",
          opacity: textTop ? 1 : 0,
        }}
      />
      {card && <AbsoluteFill style={{ background: paper, transform: `scale(${cardPop})` }} />}
      {b.text && (
        <AbsoluteFill style={{ transform: card ? `scale(${cardPop})` : undefined }}>
          <TypeBlock key={b.start} f={f} start={b.start} end={b.end} block={b.text} ink={ink} paper={paper} exitOut={b.end < FRAMES} />
        </AbsoluteFill>
      )}
      {/* barra de progresso fina */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 6,
          width: `${(100 * f) / (FRAMES - 1)}%`,
          background: ink,
          opacity: 0.9 * (1 - ei(f, FRAMES - 4, FRAMES)),
        }}
      />
    </AbsoluteFill>
  );
};
