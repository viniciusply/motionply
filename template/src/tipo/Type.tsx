import React, { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { e, ei, es, MONO, NEG_RED } from "../ui";
import { syncTokens } from "./sync";

// Tipografia Motion — composição tipográfica editorial sobre o vídeo.
// Mini-marcação usada nas linhas do roteiro:
//   PALAVRA      Inter Black (caixa-alta recomendada)
//   *palavras*   serifa itálica (Instrument Serif) — contraste elegante
//   [palavras]   marcador (faixa que abre como barra carregando)
//   _palavras_   contorno (outline)
//   ~palavras~   riscado (linha atravessa depois que a palavra aparece)
// Cada linha ganha o tamanho que a faz ocupar a largura (pôster), com teto.

export const { fontFamily: SERIF } = loadSerif("italic", { weights: ["400"], subsets: ["latin"] });
export const { fontFamily: SANS } = loadInter("normal", { weights: ["500", "800", "900"], subsets: ["latin"] });

type Kind = "sans" | "serif" | "mark" | "outline" | "strike";
export type Tok = { t: string; kind: Kind };

export const parseLine = (line: string): Tok[] => {
  const out: Tok[] = [];
  const re = /\*([^*]+)\*|\[([^\]]+)\]|_([^_]+)_|~([^~]+)~|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const [kind, text]: [Kind, string] = m[1]
      ? ["serif", m[1]]
      : m[2]
        ? ["mark", m[2]]
        : m[3]
          ? ["outline", m[3]]
          : m[4]
            ? ["strike", m[4]]
            : ["sans", m[5]];
    for (const t of text.split(/\s+/).filter(Boolean)) out.push({ t, kind });
  }
  return out;
};

// largura média (em "em") por caractere — estimativa para o encaixe na largura
const cw = (ch: string, serif: boolean) => {
  if (ch === " ") return serif ? 0.22 : 0.24;
  if (serif) return /[mwMW]/.test(ch) ? 0.62 : /[iljtfr.,'!:;]/.test(ch) ? 0.25 : /[A-Z]/.test(ch) ? 0.58 : 0.43;
  if (/[iljI1.,'!:;|]/.test(ch)) return 0.3;
  if (/[mwMW]/.test(ch)) return 0.92;
  if (/[A-Z0-9$%×+=?]/.test(ch)) return 0.74;
  if (/[ftr]/.test(ch)) return 0.4;
  return 0.6;
};
const lineEm = (toks: Tok[]) =>
  toks.reduce((acc, k, i) => acc + [...k.t].reduce((a, ch) => a + cw(ch, k.kind === "serif"), 0) + (i ? 0.26 : 0) + (k.kind === "mark" ? 0.12 : 0), 0);

export const fitSize = (toks: Tok[], width: number, max: number) => Math.min(max, Math.floor(width / Math.max(1, lineEm(toks))));

/* --------------------------------------------------------------- palavra */
const Word: React.FC<{
  tok: Tok;
  f: number;
  at: number;
  size: number;
  ink: string; // cor do texto
  paper: string; // cor oposta (texto dentro do marcador)
  joinL: boolean;
  joinR: boolean;
}> = ({ tok, f, at, size, ink, paper, joinL, joinR }) => {
  const p = e(f, at, at + 9);
  const serif = tok.kind === "serif";
  const mark = tok.kind === "mark";
  const base: React.CSSProperties = {
    display: "inline-block",
    fontFamily: serif ? SERIF : SANS,
    fontStyle: serif ? "italic" : "normal",
    fontWeight: serif ? 400 : 900,
    letterSpacing: serif ? "-0.01em" : "-0.045em",
    lineHeight: 1,
    whiteSpace: "pre",
  };
  if (mark) {
    // faixa contínua entre palavras marcadas vizinhas; abre da esquerda para a direita
    const r = "0.1em";
    return (
      <span
        style={{
          ...base,
          color: paper,
          background: ink,
          padding: `0.06em ${joinR ? "0.13em" : "0.12em"} 0.04em ${joinL ? 0 : "0.12em"}`,
          marginRight: joinR ? "-0.02em" : 0,
          borderRadius: `${joinL ? 0 : r} ${joinR ? 0 : r} ${joinR ? 0 : r} ${joinL ? 0 : r}`,
          clipPath: p < 1 ? `inset(-0.4em ${(1 - es(f, at, at + 10)) * 100}% -0.4em 0)` : undefined, // não corta acentos
        }}
      >
        {tok.t + (joinR ? " " : "")}
      </span>
    );
  }
  // revelação por máscara: a palavra sobe de dentro da linha
  // negação (~palavra~): P&B -> vermelho; outras paletas -> linha horizontal (nunca inclinada)
  const neg = tok.kind === "strike";
  const red = neg && MONO;
  const strike = neg && !MONO ? es(f, at + 12, at + 20) : 0;
  const negColor = ink === "#fff" ? NEG_RED.onDark : NEG_RED.onLight;
  return (
    // a máscara sobe 0,24em acima da linha: acentos (Á, Ê, Ã) ficam DENTRO dela e só aparecem com a palavra
    <span style={{ ...base, position: "relative", overflow: "hidden", verticalAlign: "top", padding: serif ? "0.26em 0.1em 0.14em 0.02em" : "0.26em 0 0.06em", marginTop: "-0.24em" }}>
      <span
        style={{
          display: "inline-block",
          transform: `translateY(${(1 - p) * 135}%)`, // 135%: o acento sai junto, escondido abaixo da máscara
          filter: serif ? `blur(${(1 - p) * 6}px)` : undefined,
          color: tok.kind === "outline" ? "transparent" : red ? negColor : ink,
          WebkitTextStroke: tok.kind === "outline" ? `${Math.max(2, size * 0.022)}px ${ink}` : undefined,
        }}
      >
        {tok.t}
      </span>
      {neg && !MONO && (
        // linha horizontal no meio da altura das letras (a máscara tem 0,26em de folga no topo)
        <span style={{ position: "absolute", left: "-2%", top: "0.78em", height: Math.max(6, size * 0.07), width: `${104 * strike}%`, background: ink, borderRadius: 4 }} />
      )}
    </span>
  );
};

/* --------------------------------------------------------------- encaixe */
// Mede a largura REAL da linha (depois que as fontes carregam) e ajusta o corpo
// para a linha ocupar a largura disponível, com teto `max`. A estimativa por
// caractere (fitSize) só serve de primeiro palpite.
const FitLine: React.FC<{ width: number; max: number; guess: number; gap: number; children: React.ReactNode }> = ({ width, max, guess, gap, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number | null>(null);
  const [handle] = useState(() => delayRender("tipografia: medindo linha"));
  useLayoutEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => {
      if (!alive || !ref.current) return;
      const w = ref.current.scrollWidth; // medido a 100 px
      setSize(Math.min(max, Math.floor((100 * width) / Math.max(1, w))));
      continueRender(handle);
    });
    return () => {
      alive = false;
    };
  }, [handle, max, width]);
  const fs = size ?? 100;
  return (
    <div style={{ fontSize: fs, lineHeight: 0.98, whiteSpace: "nowrap", marginTop: gap * (size ?? guess) }}>
      <div ref={ref} style={{ display: "inline-block", visibility: size === null ? "hidden" : "visible" }}>
        {children}
      </div>
    </div>
  );
};

/* --------------------------------------------------------------- bloco */
export type Block = {
  lines: string[];
  style?: "stack" | "rsvp"; // stack = pôster com linhas encaixadas; rsvp = uma palavra por vez, enorme
  align?: "left" | "center";
  pos?: "top" | "center";
  max?: number; // teto do corpo (px)
};

/** Área do bloco na tela. Padrão = vertical 1080x1920 (x 70–1010, topo 200). No 16:9, ver tela/TelaVideo.tsx. */
export type Area = { left: number; width: number; top?: number; center?: boolean };
const AREA_VERTICAL: Area = { left: 70, width: 940, top: 200 };

export const TypeBlock: React.FC<{ f: number; start: number; end: number; block: Block; ink: string; paper: string; exitOut?: boolean; area?: Area }> = ({
  f,
  start,
  end,
  block,
  ink,
  paper,
  exitOut = true,
  area,
}) => {
  const A = area ?? AREA_VERTICAL;
  const W = A.width;
  const centered = block.pos === "center" || !!A.center;
  const lines = block.lines.map(parseLine);
  const flat = lines.flat();
  const ats = syncTokens(
    flat.map((k) => k.t),
    start,
    end,
  );
  const out = exitOut ? ei(f, end - 6, end) : 0;
  const wrap: React.CSSProperties = {
    position: "absolute",
    left: A.left,
    width: W,
    top: centered ? undefined : (A.top ?? 200),
    ...(centered ? { top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" } : {}),
    textAlign: block.align ?? "center",
    opacity: 1 - out,
    transform: `translateY(${-out * 40}px)`,
    filter: `blur(${out * 10}px)`,
    color: ink,
    textShadow: ink === "#fff" ? "0 4px 30px #0007" : undefined,
  };

  if (block.style === "rsvp") {
    // uma palavra por vez, no mesmo lugar, com pequeno "soco" de escala
    let idx = 0;
    ats.forEach((a, i) => {
      if (f >= a) idx = i;
    });
    const tok = flat[idx];
    const size = fitSize([tok], W, block.max ?? 300);
    const bump = 1 + 0.12 * (1 - e(f, ats[idx], ats[idx] + 7));
    return (
      <div style={wrap}>
        <div style={{ transform: `scale(${bump})`, transformOrigin: "50% 60%" }}>
          <FitLine key={idx} width={W} max={block.max ?? 300} guess={size} gap={0}>
            <Word tok={tok} f={f} at={ats[idx]} size={size} ink={ink} paper={paper} joinL={false} joinR={false} />
          </FitLine>
        </div>
      </div>
    );
  }

  let n = 0;
  return (
    <div style={wrap}>
      {lines.map((toks, li) => {
        const size = fitSize(toks, W, block.max ?? 230);
        return (
          <FitLine key={li} width={W} max={block.max ?? 230} guess={size} gap={li ? 0.02 : 0}>
            {toks.map((tok, ti) => {
              const at = ats[n++];
              const joinL = tok.kind === "mark" && toks[ti - 1]?.kind === "mark";
              const joinR = tok.kind === "mark" && toks[ti + 1]?.kind === "mark";
              return (
                <React.Fragment key={ti}>
                  {ti > 0 && !joinL ? " " : null}
                  <Word tok={tok} f={f} at={at} size={size} ink={ink} paper={paper} joinL={joinL} joinR={joinR} />
                </React.Fragment>
              );
            })}
          </FitLine>
        );
      })}
    </div>
  );
};
