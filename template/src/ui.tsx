import React from "react";
import { Easing, Img, interpolate, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

import { CONFIG } from "./config";

// Paletas. Tema claro = inversão de luminância da paleta (ver LIGHT_FILTER).
const PALETTES = {
  azul: {
    acc: "#6CB8FF", ice: "#DCEBFF", navy: "#123A8F", ink: "#051029", panel: "#08132E", panel2: "#0D1C40",
    line: "#1D3263", muted: "#8FA3C8", gptBg: "#0B1531", gptInput: "#15254D", track: "#12224A",
    barDim: "linear-gradient(180deg, #1B3470, #0B1A3C)", soft: "#4E6BA8", ring: "#34497A", hilite: "#0F2A63",
    iconFill: "#2A4480", navyBright: "#1A4AB0", glowDark: "#123A8F55", glowLight: "#6CB8FF33",
    overlayGrad: "linear-gradient(180deg, #02081A00 0%, #061640C0 34%, #04102E 58%, #01040C 100%)",
    overlayBg: "#08132EE6", bubbleBg: "#0B1638D9", sub: "#C9D6F2", placeholder: "#9FB0D0", marker: false,
  },
  mono: {
    // neutros inspirados nos cinzas de sistema da Apple (modo escuro); contraste de texto >= 4,5:1
    acc: "#FFFFFF", ice: "#F5F5F7", navy: "#48484A", ink: "#000000", panel: "#1C1C1E", panel2: "#2C2C2E",
    line: "#3A3A3C", muted: "#98989F", gptBg: "#1C1C1E", gptInput: "#2C2C2E", track: "#2C2C2E",
    barDim: "linear-gradient(180deg, #3A3A3C, #2C2C2E)", soft: "#8E8E93", ring: "#48484A", hilite: "#2C2C2E",
    iconFill: "#48484A", navyBright: "#636366", glowDark: "#FFFFFF0D", glowLight: "#0000000A",
    overlayGrad: "linear-gradient(180deg, #0000 0%, #00000099 30%, #000000D9 55%, #000 100%)",
    overlayBg: "rgba(28,28,30,0.62)", bubbleBg: "rgba(28,28,30,0.66)", sub: "#D1D1D6", placeholder: "#98989F", marker: true,
  },
};
export const P = PALETTES[CONFIG.PALETTE];

export const ACC = P.acc; // acento
export const ICE = P.ice;
export const NAVY = P.navy;
export const INK = P.ink; // texto sobre o acento
export const BG = "#000";
export const PANEL = P.panel;
export const PANEL2 = P.panel2;
export const LINE = P.line;
export const MUTED = P.muted;
export const GPT_BG = P.gptBg;
export const GPT_INPUT = P.gptInput;
/** Elevação (sombra neutra). Sem brilho neon: contenção visual é o padrão (HIG). */
export const GLOW = "0 10px 30px rgba(0,0,0,0.35)";

/* ------------------------------------------------------------------------ */
/* Sistema de design                                                           */
/* ------------------------------------------------------------------------ */
// Vídeo de 1080 px exibido num iPhone (~390 pt de largura) -> 1 pt ~ 2,77 px.
// HIG: mínimo 11 pt / padrão 17 pt -> texto nunca abaixo de 30 px; corpo ~ 44-48 px.
export const TYPE = { caption: 30, body: 36, callout: 44, title: 56, headline: 72, display: 96 } as const;

/** Tracking óptico (como o SF): corpo grande aperta, corpo pequeno abre levemente. Retorna px. */
export const tracking = (size: number) =>
  size * (size >= 80 ? -0.035 : size >= 48 ? -0.025 : size >= 36 ? -0.012 : size >= 30 ? -0.004 : 0.01);

/**
 * Área segura do Reels/TikTok (1080x1920): topo (status/abas) e base (legenda, @, áudio)
 * ficam cobertos pela interface do app; na metade de baixo a coluna de botões ocupa a direita.
 */
export const SAFE = { top: 180, bottom: 1560, left: 60, right: 60, rightLow: 150 } as const;

/** Material translúcido para cartões sobre o vídeo (blur + escurecimento), em vez de caixa opaca. */
export const MATERIAL: React.CSSProperties = {
  background: "rgba(28,28,30,0.55)",
  backdropFilter: "blur(30px) saturate(160%)",
  WebkitBackdropFilter: "blur(30px) saturate(160%)",
};
export const HAIRLINE = "1px solid rgba(255,255,255,0.14)";

/**
 * NEGAÇÃO ("não tem", "nunca mais", "isso não significa"): NUNCA risco inclinado.
 * Paleta preto e branco -> a palavra fica VERMELHA (vermelho de sistema, sem linha).
 * Outras paletas -> linha HORIZONTAL atravessando a palavra.
 */
export const MONO = CONFIG.PALETTE === "mono";
export const NEG_RED = { onDark: "#FF453A", onLight: "#D70015" } as const;

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const OUT = Easing.bezier(0.22, 1, 0.36, 1); // easeOutQuint
const IN = Easing.bezier(0.64, 0, 0.78, 0); // easeInQuint
const S = Easing.bezier(0.65, 0, 0.35, 1);

// Entrada: desacelera ao chegar.
/** Tema claro: inverte a luminância preservando o matiz (fundo branco, detalhes azul-escuro). */
export const LIGHT_FILTER = "invert(1) hue-rotate(180deg)";

export const e = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing: OUT });
// Saída: começa devagar e acelera.
export const ei = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing: IN });
// Reposicionamento/morph: curva S.
export const es = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing: S });
// Pop: chegada com assentamento curto (sem quique exagerado).
export const pop = (f: number, a: number, dur = 12) =>
  interpolate(f, [a, a + dur], [0, 1], { ...clamp, easing: Easing.bezier(0.34, 1.22, 0.64, 1) });

/** Mostra algo entre [a, b) com entrada e saída suaves. */
export const window_ = (f: number, a: number, b: number, inDur = 7, outDur = 5) =>
  Math.min(e(f, a, a + inDur), 1 - ei(f, b - outDur, b));

/* ------------------------------------------------------------------------ */
/* Abertura "barra carregando": uma barra fina cresce da esquerda p/ direita,  */
/* depois se abre verticalmente na caixa; o conteúdo entra por último.         */
/* ------------------------------------------------------------------------ */
export const Box: React.FC<{
  f: number;
  at: number;
  dur?: number;
  style?: React.CSSProperties; // layout (posição/tamanho/padding/flex)
  bg?: string;
  border?: string;
  radius?: number;
  glow?: boolean; // elevação (sombra), não brilho
  material?: boolean; // translúcido sobre o vídeo
  children?: React.ReactNode;
}> = ({ f, at, dur = 11, style, bg = PANEL, border = `2px solid ${LINE}`, radius = 24, glow, material, children }) => {
  if (f < at) return <div style={{ ...style, visibility: "hidden" }}>{children}</div>;
  const load = e(f, at, at + dur * 0.5);
  const open = es(f, at + dur * 0.38, at + dur);
  const content = e(f, at + dur * 0.7, at + dur + 6);
  const inset = (1 - open) * 50;
  return (
    <div style={{ position: "relative", ...style }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          ...(material ? MATERIAL : { background: bg }),
          border: material ? HAIRLINE : border,
          borderRadius: radius,
          clipPath: `inset(${inset}% 0 ${inset}% 0 round ${radius}px)`,
          boxShadow: glow ? "0 24px 60px rgba(0,0,0,0.45)" : undefined,
        }}
      />
      {/* barra de carregamento */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          height: 3,
          marginTop: -1.5,
          width: `${load * 100}%`,
          borderRadius: 2,
          background: ACC,
          opacity: 1 - e(f, at + dur * 0.55, at + dur),
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          opacity: content,
          transform: `translateY(${(1 - content) * 14}px)`,
          filter: `blur(${(1 - content) * 6}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Barra de progresso: trilho carrega, depois o preenchimento cresce até `value`. */
export const Bar: React.FC<{
  f: number;
  at: number;
  value: number; // 0–1
  fillAt?: number;
  fillDur?: number;
  height?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ f, at, value, fillAt, fillDur = 14, height = 30, color = ACC, style }) => {
  const track = e(f, at, at + 10);
  const start = fillAt ?? at + 6;
  const fill = es(f, start, start + fillDur) * value;
  return (
    <div style={{ height, borderRadius: height / 2, background: P.track, width: `${track * 100}%`, overflow: "hidden", ...style }}>
      <div style={{ height: "100%", width: `${(fill / Math.max(track, 0.001)) * 100}%`, borderRadius: height / 2, background: color }} />
    </div>
  );
};

/** Linha/seta que se desenha como carregamento, com ponto luminoso na ponta. */
export const DrawLine: React.FC<{
  f: number;
  at: number;
  dur?: number;
  d: string;
  width: number;
  height: number;
  style?: React.CSSProperties;
  stroke?: string;
  strokeWidth?: number;
  arrow?: boolean;
  dash?: boolean;
}> = ({ f, at, dur = 11, d, width, height, style, stroke = ACC, strokeWidth = 6, arrow, dash }) => {
  const p = es(f, at, at + dur);
  const id = `m${Math.abs(d.length * 31 + at)}`;
  return (
    <svg width={width} height={height} style={{ position: "absolute", overflow: "visible", ...style }}>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill={stroke} />
        </marker>
        <mask id={`${id}k`}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={strokeWidth + 30} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
        </mask>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dash ? "14 12" : undefined}
        mask={`url(#${id}k)`}
        markerEnd={arrow && p > 0.98 ? `url(#${id})` : undefined}
      />
    </svg>
  );
};

/** Ícone neutro de "assistente de IA" (brilho de 4 pontas). Logotipos de marcas só com o arquivo oficial do usuário. */
export const Logo: React.FC<{ size?: number; dark?: boolean }> = ({ size = 60, dark }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
    <path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5z" fill={dark ? "#000" : "#fff"} />
    <circle cx="18.5" cy="18.5" r="2" fill={dark ? "#000" : "#fff"} />
  </svg>
);

/** Objeto 3D (PNG transparente) da pasta public/gpt/. */
export const Obj: React.FC<{ name: string; f: number; at: number; h: number; style?: React.CSSProperties; float?: boolean }> = ({
  name,
  f,
  at,
  h,
  style,
  float = false,
}) => {
  const p = pop(f, at, 10);
  const bob = float ? Math.sin((f - at) / 14) * 6 * e(f, at + 10, at + 24) : 0;
  return (
    <Img
      className="keep"
      src={staticFile(`gpt/${name}.png`)}
      style={{
        height: h,
        opacity: e(f, at, at + 6),
        transform: `translateY(${(1 - p) * 40 + bob}px) scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -8}deg)`,
        filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))",
        ...style,
      }}
    />
  );
};

/** Wordmark tipográfico genérico (troque pelo nome da marca do vídeo). */
export const Wordmark: React.FC<{ size?: number; color?: string }> = ({ size = 44, color = "#fff" }) => (
  <span style={{ fontSize: size, fontWeight: 800, letterSpacing: -size * 0.04, color }}>
    suamarca<span style={{ color: ACC }}>.</span>
  </span>
);

export const Cursor: React.FC<{ x: number; y: number; press?: number; opacity?: number }> = ({ x, y, press = 0, opacity = 1 }) => (
  <svg
    width="54"
    height="66"
    viewBox="0 0 58 70"
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      transform: `scale(${1 - press * 0.16})`,
      transformOrigin: "0 0",
      zIndex: 20,
      filter: "drop-shadow(0 6px 12px #000a)",
    }}
  >
    <path d="M2 2 L7 54 L20 40 L32 63 L43 57 L31 35 L50 32 Z" fill="white" stroke={INK} strokeWidth="4" />
  </svg>
);

/** Anel de clique que nasce no mesmo frame do clique. */
export const Ripple: React.FC<{ f: number; at: number; x: number; y: number }> = ({ f, at, x, y }) => {
  const p = e(f, at, at + 16);
  if (f < at || p >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 45 * p - 10,
        top: y - 45 * p - 10,
        width: 20 + 90 * p,
        height: 20 + 90 * p,
        borderRadius: "50%",
        border: `4px solid ${ACC}`,
        boxShadow: GLOW,
        opacity: 1 - p,
        zIndex: 19,
      }}
    />
  );
};

type Word = { t: string; at: number; accent?: boolean };
/** Cria palavras com frames globais — use o frame real da palavra quando existir. */
export const ws = (text: string, ats: number[] | number, accent = false, step = 4): Word[] =>
  text.split(" ").map((t, i) => ({
    t,
    at: Array.isArray(ats) ? ats[Math.min(i, ats.length - 1)] : ats + i * step,
    accent,
  }));

/** Lettering por palavra: cada palavra ocupa sua posição final desde o início (sem a frase pular). */
export const Words: React.FC<{
  f: number;
  lines: Word[][];
  size?: number;
  weight?: number;
  align?: "left" | "center";
  lineHeight?: number;
}> = ({ f, lines, size = 76, weight = 700, align = "left", lineHeight = 1.06 }) => (
  <div style={{ textAlign: align, fontSize: size, fontWeight: weight, lineHeight, letterSpacing: tracking(size) }}>
    {lines.map((line, i) => (
      <div key={i}>
        {line.map((w, j) => {
          const p = e(f, w.at, w.at + 8);
          // marcador contínuo: palavras de destaque vizinhas formam UMA faixa (não uma pílula por palavra)
          const mk = w.accent && P.marker;
          const joinL = mk && !!line[j - 1]?.accent;
          const joinR = mk && !!line[j + 1]?.accent;
          const r = ".12em";
          return (
            <React.Fragment key={j}>
              {j > 0 ? (
                joinL ? (
                  <span style={{ display: "inline-block", background: ACC, opacity: p, whiteSpace: "pre" }}> </span>
                ) : (
                  " "
                )
              ) : null}
              <span
                style={{
                  display: "inline-block",
                  opacity: p,
                  transform: mk ? undefined : `translateY(${(1 - p) * size * 0.45}px) scale(${0.94 + 0.06 * p})`,
                  filter: `blur(${(1 - p) * 10}px)`,
                  color: w.accent ? (P.marker ? INK : ACC) : undefined,
                  background: mk ? ACC : undefined,
                  padding: mk ? `0 ${joinR ? 0 : ".12em"} 0 ${joinL ? 0 : ".12em"}` : undefined,
                  borderRadius: mk ? `${joinL ? 0 : r} ${joinR ? 0 : r} ${joinR ? 0 : r} ${joinL ? 0 : r}` : undefined,
                  // o marcador "abre" da esquerda p/ direita como barra carregando
                  clipPath: mk && p < 1 ? `inset(-0.4em ${(1 - p) * 100}% -0.4em 0)` : undefined, // margem vertical: não corta acentos (Ã, É)
                  // cobre a fresta de subpixel entre palavra e espaço marcados
                  boxShadow: mk && (joinL || joinR) ? [joinL && `-3px 0 0 ${ACC}`, joinR && `3px 0 0 ${ACC}`].filter(Boolean).join(", ") : undefined,
                }}
              >
                {w.t}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    ))}
  </div>
);

/** Título do modo dividido; troca de texto com saída e nova entrada. */
export const Header: React.FC<{
  f: number;
  states: { from: number; to: number; lines: Word[][] }[];
  top?: number;
  size?: number;
}> = ({ f, states, top = 118, size = 74 }) => (
  <>
    {states.map((s, i) => {
      if (f < s.from - 1 || f >= s.to) return null;
      const out = ei(f, s.to - 6, s.to);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 70,
            right: 70,
            top,
            opacity: 1 - out,
            transform: `translateY(${-out * 36}px)`,
            filter: `blur(${out * 10}px)`,
          }}
        >
          <Words f={f} lines={s.lines} size={size} />
        </div>
      );
    })}
  </>
);

export const Chip: React.FC<{ children: React.ReactNode; on?: boolean; style?: React.CSSProperties }> = ({ children, on, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 24px",
      borderRadius: 999,
      background: on ? ACC : PANEL2,
      color: on ? INK : "#fff",
      border: on ? "none" : HAIRLINE,
      fontSize: TYPE.caption,
      letterSpacing: tracking(TYPE.caption),
      fontWeight: 700,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------------ */
/* Ícones vetoriais: traço uniforme e cantos arredondados, no espírito do SF    */
/* Symbols. Substituem glifos de texto (check, x, seta, bolinha, coração) que   */
/* vinham de fontes diferentes, com pesos diferentes.                           */
/* ------------------------------------------------------------------------ */
export type IconName = "check" | "xmark" | "arrowUp" | "arrowRight" | "chevronDown" | "play" | "heart" | "dot" | "bolt";
export const Icon: React.FC<{ name: IconName; size?: number; color?: string; weight?: number; style?: React.CSSProperties }> = ({
  name,
  size = 32,
  color = "currentColor",
  weight = 2.4,
  style,
}) => {
  const st = { fill: "none", stroke: color, strokeWidth: weight, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<IconName, React.ReactNode> = {
    check: <path d="M5 12.5l4.5 4.5L19 7.5" {...st} />,
    xmark: <path d="M6 6l12 12M18 6L6 18" {...st} />,
    arrowUp: <path d="M12 19V5M6 11l6-6 6 6" {...st} />,
    arrowRight: <path d="M5 12h14M13 6l6 6-6 6" {...st} />,
    chevronDown: <path d="M6 9.5l6 6 6-6" {...st} />,
    play: <path d="M8 5.5v13l10.5-6.5z" fill={color} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />,
    heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0112 7.3 4.3 4.3 0 0119.5 10c0 5.4-7.5 10-7.5 10z" fill={color} />,
    dot: <circle cx="12" cy="12" r="5" fill={color} />,
    bolt: <path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" fill={color} stroke={color} strokeWidth={1} strokeLinejoin="round" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}>
      {paths[name]}
    </svg>
  );
};
