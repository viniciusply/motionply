import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ACC, Chip, clamp, e, ei, fontFamily, GLOW, LIGHT_FILTER, NAVY, P } from "./ui";
import { camera } from "./camera";
import { Dir, FRAMES, Mode, SPEED, SPLIT, TIMELINE, toOut } from "./timeline";
import { SImpacto, SGrade, SContador, SDashboard, SDuo, SChecklist, SPipeline, SPrompt, STitulo } from "./Scenes";
import { SCta, SHook, SIdentidade, SEnfase } from "./FaceScenes";

export { FPS, FRAMES, OUT_FRAMES } from "./timeline";
const PANEL_H = 1920 - SPLIT;

const SCENES: Record<string, React.FC<{ f: number }>> = {
  hook: SHook,
  titulo: STitulo,
  duo: SDuo,
  prompt: SPrompt,
  contador: SContador,
  identidade: SIdentidade,
  grade: SGrade,
  pipeline: SPipeline,
  impacto: SImpacto,
  enfase: SEnfase,
  dashboard: SDashboard,
  checklist: SChecklist,
  cta: SCta,
};

/**
 * Trechos do comercial (comercial.mp4, 30 FPS, sem áudio) que substituem o rosto
 * no painel de baixo. `src` = frame inicial no comercial. A voz continua do master.
 */
const BROLL: { from: number; to: number; src: number; label: string }[] = [
  // exemplo (precisa de public/comercial.mp4 e CONFIG.BROLL = true):
  // { from: 207, to: 297, src: 129, label: "Trecho do vídeo adicional" },
];

const V: Record<Dir, [number, number]> = {
  right: [70, 0],
  left: [-70, 0],
  up: [0, -55],
  down: [0, 55],
};

/** Painel de baixo: o comercial entra e sai por esmaecimento (opacidade + leve zoom/desfoque). */
const BRoll: React.FC<{ f: number; seg: (typeof BROLL)[number] }> = ({ f, seg }) => {
  const fadeIn = e(f, seg.from, seg.from + 9);
  const fadeOut = ei(f, seg.to - 9, seg.to);
  const o = fadeIn * (1 - fadeOut);
  const zoom = 1.08 - 0.08 * e(f, seg.from, seg.from + 30) + 0.04 * fadeOut;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: PANEL_H, opacity: o, filter: `blur(${(1 - o) * 10}px)` }}>
      <Sequence from={toOut(seg.from)} durationInFrames={toOut(seg.to) - toOut(seg.from)} layout="none">
        {/* fundo: o mesmo quadro ampliado e desfocado preenche o painel vertical */}
        <OffthreadVideo
          src={staticFile("comercial.mp4")}
          startFrom={seg.src}
          playbackRate={SPEED}
          muted
          style={{ position: "absolute", left: -600, top: 0, width: 2280, height: PANEL_H, objectFit: "cover", filter: "blur(40px) brightness(0.45) saturate(1.2)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #000 0%, #0000 22%, #0000 78%, #000 100%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: (PANEL_H - 464) / 2 - 10, height: 464, overflow: "hidden" }}>
          <OffthreadVideo src={staticFile("comercial.mp4")} startFrom={seg.src} playbackRate={SPEED} muted style={{ width: 1080, height: 464, transform: `scale(${zoom})` }} />
        </div>
      </Sequence>
      <div style={{ position: "absolute", left: 60, top: (PANEL_H - 464) / 2 - 80, opacity: e(f, seg.from + 6, seg.from + 14) }}>
        <Chip>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: ACC, boxShadow: GLOW }} /> {seg.label}
        </Chip>
      </div>
    </div>
  );
};

const clipH = (mode: Mode) => (mode === "split" ? SPLIT : 1920);

const Scene: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const b = TIMELINE[i];
  const C = SCENES[b.id];
  const local = f - b.start;
  const dur = b.end - b.start;
  const last = b.end >= FRAMES;
  const enter = b.start === 0 ? 1 : e(local, 0, 10);
  const exit = last ? 0 : ei(local, dur - 7, dur);
  const inV = V[TIMELINE[i - 1]?.dir ?? "up"];
  const outV = V[b.dir];
  const x = -inV[0] * (1 - enter) + outV[0] * exit;
  const y = -inV[1] * (1 - enter) + outV[1] * exit;
  const drift = 0.025 * interpolate(local, [0, dur], [0, 1], clamp); // movimento contínuo sutil
  const invert = b.light ? ` ${LIGHT_FILTER}` : "";
  return (
    <AbsoluteFill style={{ height: clipH(b.mode), overflow: "hidden" }}>
      <AbsoluteFill
        className={b.light ? "light" : undefined}
        style={{
          opacity: Math.min(1, enter * 1.3) * (1 - exit),
          transform: `translate(${x}px,${y}px) scale(${1 + drift + 0.035 * (1 - enter) - 0.025 * exit})`,
          filter: `blur(${(1 - enter) * 12 + exit * 12}px)${invert}`,
        }}
      >
        <C f={f} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const MeuVideo: React.FC = () => {
  // todo o motion roda no tempo do vídeo-fonte; SPEED só acelera o resultado
  const f = useCurrentFrame() * SPEED;
  const cam = camera(f);
  const idx = TIMELINE.findIndex((b) => f >= b.start && f < b.end);
  const seg = BROLL.find((s) => f >= s.from && f < s.to);
  const L = cam.light;
  // modo claro em branco suavizado (#F5F5F7), não branco puro — evita o "brilho" (HIG, Dark Mode)
  const bg = `rgb(${Math.round(245 * L)},${Math.round(245 * L)},${Math.round(247 * L)})`;
  return (
    <AbsoluteFill style={{ background: bg, color: "#fff", fontFamily }}>
      {/* tema claro: fotos, vídeos e objetos 3D são contra-invertidos para manter as cores reais */}
      <style>{`.light .keep{filter:${LIGHT_FILTER} !important}`}</style>
      {/* brilho azul sutil no topo (tema escuro) */}
      <div style={{ position: "absolute", left: -200, right: -200, top: -500, height: 1100, background: `radial-gradient(ellipse at center, ${P.glowDark}, transparent 65%)`, opacity: 1 - L }} />
      {/* brilho azul claro no tema claro */}
      <div style={{ position: "absolute", left: -200, right: -200, top: -500, height: 1100, background: `radial-gradient(ellipse at center, ${P.glowLight}, transparent 65%)`, opacity: L }} />
      {/* vídeo master contínuo: nunca desmonta — a voz não reinicia. A câmera segue o rosto. */}
      <div style={{ position: "absolute", left: 0, top: cam.winTop, width: 1080, height: 1920 - cam.winTop, overflow: "hidden", transform: `translateY(${cam.panelY}px)` }}>
        <OffthreadVideo src={staticFile("video.mp4")} playbackRate={SPEED} style={{ position: "absolute", left: cam.X, top: cam.Y - cam.winTop, width: 1080 * cam.s, height: 1920 * cam.s }} />
        {seg && <BRoll f={f} seg={seg} />}
      </div>
      {/* junção ilustração/vídeo: começa na cor do fundo (cobre a borda) e dissolve no vídeo */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: cam.winTop + cam.panelY - 6,
          height: 230,
          background: "linear-gradient(180deg, #000 0px, #000 14px, #000000cc 60px, #00000055 140px, #0000 230px)",
          opacity: (1 - cam.open) * (1 - L),
        }}
      />
      {/* tema claro: borda limpa, sem névoa sobre o rosto */}
      <div style={{ position: "absolute", left: 0, right: 0, top: cam.winTop + cam.panelY - 6, height: 8, background: bg, opacity: (1 - cam.open) * L }} />
      {/* modo rosto: base em degradê azul-escuro → preto para a animação em overlay */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1080,
          height: 840,
          background: P.overlayGrad,
          opacity: cam.face,
          transform: `translateY(${cam.panelY}px)`,
        }}
      />
      {idx >= 0 && <Scene key={TIMELINE[idx].id} i={idx} f={f} />}
      <div style={{ position: "absolute", bottom: 0, left: 0, height: 4, width: `${(100 * f) / (FRAMES - 1)}%`, background: ACC, opacity: 0.85, zIndex: 60 }} />
    </AbsoluteFill>
  );
};
