import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { e, ei } from "../ui";
import { FRAMES, SPEED } from "../timeline";
import { Area, SANS, TypeBlock } from "../tipo/Type";
import { camTela } from "./camTela";
import { VH, VW } from "./layout";

// TIPOGRAFIA MOTION HORIZONTAL (16:9): gravação de tela + webcam.
// Mesma linguagem da vertical: corte de enquadramento por frase, socos de zoom, face tracking pontual,
// tipografia editorial e cartões preto/branco. Roteiro em ./roteiroTela.ts.

// áreas de texto (1920x1080) e o véu que garante contraste sobre a tela gravada
const AREAS: Record<string, Area> = {
  left: { left: 110, width: 760, center: true },
  right: { left: 1050, width: 760, center: true },
  bottom: { left: 160, width: 1600, top: 800 },
  card: { left: 260, width: 1400, center: true },
};
const VEIL: Record<string, string> = {
  left: "linear-gradient(90deg, #000000E6 0%, #000000B8 40%, #0000 64%)",
  right: "linear-gradient(270deg, #000000E6 0%, #000000B8 40%, #0000 64%)",
  bottom: "linear-gradient(0deg, #000000E6 0%, #000000A8 28%, #0000 50%)",
};

export const TelaVideo: React.FC = () => {
  const f = useCurrentFrame() * SPEED;
  const cam = camTela(f);
  const b = cam.beat;
  const card = b.card;
  const ink = card === "white" ? "#1D1D1F" : "#fff";
  const paper = card === "white" ? "#F5F5F7" : "#000";
  const cardPop = card ? 1.04 - 0.04 * e(f, b.start, b.start + 7) : 1;
  const side = card ? "card" : (b.side ?? "left");
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: SANS }}>
      <AbsoluteFill style={{ transform: cam.mirror ? "scaleX(-1)" : undefined }}>
        <OffthreadVideo
          src={staticFile("video.mp4")}
          playbackRate={SPEED}
          style={{ position: "absolute", left: cam.X, top: cam.Y, width: VW * cam.s, height: VH * cam.s }}
        />
      </AbsoluteFill>
      {!card && b.text && <AbsoluteFill style={{ background: VEIL[side] }} />}
      {card && <AbsoluteFill style={{ background: paper, transform: `scale(${cardPop})` }} />}
      {b.text && (
        <AbsoluteFill style={{ transform: card ? `scale(${cardPop})` : undefined }}>
          <TypeBlock
            key={b.start}
            f={f}
            start={b.start}
            end={b.end}
            block={{ max: side === "bottom" ? 130 : side === "card" ? 250 : 190, ...b.text }}
            ink={ink}
            paper={paper}
            exitOut={b.end < FRAMES}
            area={AREAS[side]}
          />
        </AbsoluteFill>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, height: 5, width: `${(100 * f) / (FRAMES - 1)}%`, background: ink, opacity: 0.85 * (1 - ei(f, FRAMES - 4, FRAMES)) }} />
    </AbsoluteFill>
  );
};
