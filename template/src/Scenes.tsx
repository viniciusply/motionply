import React from "react";
import { Img, interpolate, OffthreadVideo, Sequence, staticFile } from "remotion";
import {
  ACC,
  Bar,
  Box,
  Chip,
  clamp,
  Cursor,
  DrawLine,
  e,
  ei,
  es,
  GLOW,
  Icon,
  MONO,
  NEG_RED,
  TYPE,
  GPT_BG,
  GPT_INPUT,
  Header,
  Wordmark,
  ICE,
  INK,
  LINE,
  Logo,
  MUTED,
  NAVY,
  Obj,
  PANEL2,
  pop,
  Ripple,
  window_,
  Words,
  ws,
  P,
} from "./ui";
import { SPEED, toOut } from "./timeline";
import { CONFIG } from "./config";

// Todos os componentes recebem o frame GLOBAL (30 FPS). Os números abaixo são
// frames de demonstração — num vídeo real, use os frames das palavras do words.ts.

const abs = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

/* ------------------------------------------------- 2. TÍTULO + gráfico de barras (full) 91–197 */
export const STitulo: React.FC<{ f: number }> = ({ f }) => {
  const bars = [0.22, 0.32, 0.4, 0.55, 0.72, 0.95];
  return (
    <>
      <div style={abs({ left: 70, right: 70, top: 300 })}>
        <Words f={f} size={46} weight={500} align="center" lines={[ws("Seu gancho aqui ↓", [91, 99, 113, 125])]} />
      </div>
      <div style={abs({ left: 50, right: 50, top: 420 })}>
        <Words f={f} size={128} weight={800} align="center" lineHeight={0.98} lines={[ws("Título", [152]), ws("em destaque.", [163, 167], true)]} />
      </div>
      {/* gráfico: barras carregam uma a uma */}
      <div style={abs({ left: 150, right: 150, top: 900, height: 560 })}>
        {bars.map((h, i) => {
          const at = 118 + i * 5;
          const grow = es(f, at + 8, at + 30);
          const load = e(f, at, at + 8);
          return (
            <div key={i} style={abs({ left: i * 132, bottom: 0, width: 96, height: 560 })}>
              <div style={abs({ left: 0, bottom: 0, height: 4, width: `${load * 100}%`, background: ACC, boxShadow: GLOW, opacity: 1 - grow })} />
              <div
                style={abs({
                  left: 0,
                  bottom: 0,
                  width: 96,
                  height: h * 560 * grow,
                  borderRadius: "16px 16px 4px 4px",
                  background: i === 5 ? `linear-gradient(180deg, ${ACC}, ${NAVY})` : P.barDim,
                  boxShadow: i === 5 ? `0 0 30px ${ACC}66` : undefined,
                  opacity: 0.55,
                })}
              />
            </div>
          );
        })}
        <DrawLine f={f} at={150} dur={30} width={780} height={560} d="M48 470 L180 420 L312 380 L444 300 L576 200 L740 30" arrow strokeWidth={7} stroke="#fff" />
      </div>
      <div style={abs({ left: 0, right: 0, top: 860, display: "flex", justifyContent: "center" })}>
        <Obj name="bag" f={f} at={156} h={560} />
      </div>
      <div style={abs({ left: 0, right: 0, top: 1560, textAlign: "center", opacity: e(f, 186, 194), transform: `translateY(${(1 - e(f, 186, 196)) * 20}px)` })}>
        <Chip on style={{ fontSize: 34, padding: "14px 30px" }}>subtítulo curto</Chip>
      </div>
    </>
  );
};

/* ---------------------------------------------------- 3. DUO: dois cards que viram um (morph) 197–301 */
export const SDuo: React.FC<{ f: number }> = ({ f }) => {
  const m = es(f, 254, 276); // morph: dois cards viram um só
  const card: React.CSSProperties = { position: "absolute", top: 360, width: 430, height: 320 };
  return (
    <>
      <Header
        f={f}
        states={[
          { from: 197, to: 254, lines: [ws("Ferramenta A", [205, 205]), ws("+ Ferramenta B", [223, 223, 227], true)] },
          { from: 256, to: 999, lines: [ws("Juntas", [258]), ws("num fluxo só.", [270, 276, 284], true)] },
        ]}
      />
      {/* moldura única que nasce no morph */}
      <Box f={f} at={252} dur={11} radius={36} border={`3px solid ${ACC}`} glow style={abs({ left: 70, top: 350, width: 940, height: 340 })} />
      <div style={{ ...card, left: interpolate(m, [0, 1], [70, 110]), transform: `scale(${1 - 0.06 * m})` }}>
        <Box f={f} at={199} dur={10} radius={32} bg={m > 0.5 ? "transparent" : undefined} border={m > 0.5 ? "none" : undefined} style={{ width: "100%", height: "100%" }}>
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
            <Logo size={120} />
            <div style={{ fontSize: 40, fontWeight: 700 }}>Ferramenta A</div>
          </div>
        </Box>
      </div>
      <div style={abs({ left: 512, top: 470, fontSize: 90, fontWeight: 300, color: ACC, opacity: e(f, 216, 224), transform: `rotate(${m * 90}deg) scale(${0.6 + 0.4 * pop(f, 216)})`, textShadow: GLOW })}>+</div>
      <div style={{ ...card, left: interpolate(m, [0, 1], [580, 540]), transform: `scale(${1 - 0.06 * m})` }}>
        <Box f={f} at={219} dur={10} radius={32} bg={m > 0.5 ? "transparent" : undefined} border={m > 0.5 ? "none" : undefined} style={{ width: "100%", height: "100%" }}>
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
            <svg viewBox="0 0 100 100" width="120" height="120">
              <defs>
                <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor={ICE} />
                  <stop offset="1" stopColor={ACC} />
                </linearGradient>
              </defs>
              <rect x="8" y="8" width="84" height="84" rx="22" fill="url(#hg)" />
              <circle cx="50" cy="50" r="17" fill="none" stroke={INK} strokeWidth="10" />
            </svg>
            <Wordmark size={40} />
          </div>
        </Box>
      </div>
      <div style={abs({ left: 0, right: 0, top: 715, textAlign: "center", opacity: e(f, 280, 290), transform: `translateY(${(1 - e(f, 280, 292)) * 16}px)` })}>
        <Chip on><Icon name="check" size={30} weight={3} /> 2 ferramentas, 1 fluxo</Chip>
      </div>
    </>
  );
};

/* ------------------------------------------- 4. PROMPT: interface de chat, digitação e 3 estados 301–479 */
const PROMPT = "Escreva aqui o pedido que a pessoa faz na fala";
export const SPrompt: React.FC<{ f: number }> = ({ f }) => {
  const send = 317; // palavra que dispara o envio
  const typed = PROMPT.slice(0, Math.floor(interpolate(f, [305, send - 2], [0, PROMPT.length], clamp)));
  const sent = f >= send;
  const cur = e(f, send - 12, send - 1);
  const st1 = window_(f, 320, 358, 10, 7);
  const st2 = window_(f, 358, 445, 10, 7);
  const st3 = e(f, 445, 455);
  const input = es(f, send, send + 12);
  const row = (icon: string, label: string, at: number) => (
    <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: TYPE.caption, color: ICE, fontWeight: 600, marginBottom: 14 }}>
      <Obj name={icon} f={f} at={at} h={62} float={false} /> {label}
    </div>
  );
  return (
    <>
      <Header
        f={f}
        states={[
          { from: 301, to: 358, lines: [ws("Primeira ação.", [317, 320], true)] },
          { from: 358, to: 445, lines: [ws("Segunda", [358]), ws("ação.", [391], true)] },
          { from: 445, to: 999, lines: [ws("Terceira", [445]), ws("ação.", [466], true)] },
        ]}
        size={68}
      />
      <Box f={f} at={298} dur={11} radius={34} bg={GPT_BG} border={`2px solid ${LINE}`} style={abs({ left: 60, right: 60, top: 300, height: 480, overflow: "hidden" })}>
        <div style={{ height: 70, display: "flex", alignItems: "center", gap: 14, padding: "0 26px", borderBottom: `1px solid ${LINE}` }}>
          <Logo size={34} />
          <span style={{ fontSize: TYPE.caption, fontWeight: 600 }}>Assistente</span>
          <Icon name="chevronDown" size={28} color={MUTED} />
        </div>
        <div
          style={abs({
            right: 24,
            top: interpolate(input, [0, 1], [300, 88]),
            left: interpolate(input, [0, 1], [24, 170]),
            minHeight: interpolate(input, [0, 1], [140, 60]),
            borderRadius: interpolate(input, [0, 1], [28, 24]),
            background: GPT_INPUT,
            border: `1px solid ${sent ? LINE : ACC + "66"}`,
            padding: interpolate(input, [0, 1], [24, 14]) + "px 24px",
            fontSize: interpolate(input, [0, 1], [32, 25]),
            lineHeight: 1.25,
            color: typed ? "#fff" : MUTED,
          })}
        >
          {typed || "Digite sua mensagem"}
          {!sent && <span style={{ color: ACC, opacity: Math.floor(f / 8) % 2 ? 1 : 0.2 }}>│</span>}
          <div
            style={abs({
              right: 14,
              bottom: 14,
              width: 52,
              height: 52,
              borderRadius: 26,
              background: sent ? ACC : "#fff",
              color: INK,
              fontSize: 30,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 1 - input,
            })}
          >
            <Icon name="arrowUp" size={30} weight={3} color={INK} />
          </div>
        </div>

        {/* Estado 1: resultado pronto */}
        <div style={abs({ left: 24, right: 24, top: 168, opacity: st1, transform: `translateY(${(1 - st1) * 24}px)`, filter: `blur(${(1 - st1) * 6}px)` })}>
          {row("megafone", "Resultado pronto", 318)}
          <div style={{ display: "flex", gap: 18 }}>
            <Box f={f} at={322} dur={12} radius={18} bg={PANEL2} style={{ width: 200, height: 200 }}>
              <div style={abs({ left: 0, right: 0, top: 0, height: 120, borderRadius: "18px 18px 0 0", background: `linear-gradient(135deg, ${ACC}, ${NAVY})` })} />
              <div style={abs({ left: 14, top: 136, width: 150, height: 12, borderRadius: 6, background: LINE })} />
              <div style={abs({ left: 14, top: 160, width: 90, height: 24, borderRadius: 12, background: "#fff" })} />
            </Box>
            <div style={{ flex: 1, fontSize: TYPE.caption, lineHeight: 1.5 }}>
              {["Item um", "Item dois", "Item três"].map((t, i) => (
                <div key={t} style={{ opacity: e(f, 328 + i * 5, 338 + i * 5), transform: `translateX(${(1 - e(f, 328 + i * 5, 340 + i * 5)) * 30}px)` }}>
                  <Icon name="check" size={28} weight={3} color={ACC} style={{ marginRight: 8 }} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Estado 2: comparativo */}
        <div style={abs({ left: 24, right: 24, top: 168, opacity: st2, transform: `translateY(${(1 - st2) * 24}px)`, filter: `blur(${(1 - st2) * 6}px)` })}>
          {row("lupa", "Comparativo", 358)}
          {[
            { n: "Opção A", v: 0.86 },
            { n: "Opção B", v: 0.64 },
            { n: "Você", v: 0.42, me: true },
          ].map((r, i) => (
            <div key={r.n} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 250, fontSize: TYPE.caption, fontWeight: r.me ? 800 : 500, color: r.me ? ACC : "#fff" }}>{r.n}</div>
              <div style={{ flex: 1 }}>
                <Bar f={f} at={362 + i * 6} fillAt={372 + i * 8} value={r.v} height={32} color={r.me ? ACC : P.soft} />
              </div>
            </div>
          ))}
        </div>

        {/* Estado 3: análise de concorrentes */}
        <div style={abs({ left: 24, right: 24, top: 168, opacity: st3, transform: `translateY(${(1 - st3) * 24}px)` })}>
          {row("chat", "Análise", 445)}
          {["Ponto um", "Ponto dois", "Ponto de destaque"].map((t, i) => (
            <Box
              key={t}
              f={f}
              at={449 + i * 5}
              dur={12}
              radius={16}
              bg={i === 2 ? P.hilite : PANEL2}
              border={i === 2 ? `2px solid ${ACC}` : `2px solid transparent`}
              style={{ padding: "12px 18px", marginBottom: 10 }}
            >
              <div style={{ fontSize: TYPE.caption, display: "flex", gap: 14, alignItems: "center" }}>
                <Icon name="dot" size={22} color={ACC} /> {t}
              </div>
            </Box>
          ))}
        </div>
      </Box>
      {f > send - 14 && f < send + 12 && (
        <Cursor
          x={60 + interpolate(cur, [0, 1], [760, 900])}
          y={300 + interpolate(cur, [0, 1], [520, 404])}
          press={Math.max(0, 1 - Math.abs(f - send) / 4)}
          opacity={1 - e(f, send + 4, send + 11)}
        />
      )}
      <Ripple f={f} at={send} x={966} y={710} />
    </>
  );
};

/* ---------------------------------------- 5. CONTADOR + grade de cards (full) 479–657 */
export const SContador: React.FC<{ f: number }> = ({ f }) => {
  const steps = [
    { at: 539, n: 10 },
    { at: 554, n: 15 },
    { at: 570, n: 20 },
    { at: 583, n: 30 },
  ];
  const cur = [...steps].reverse().find((s) => f >= s.at);
  const count = cur ? cur.n : 0;
  const bump = cur ? 1 + 0.16 * (1 - e(f, cur.at, cur.at + 10)) : 1;
  const strike = es(f, 634, 648);
  const over = e(f, 648, 658);
  const intro = 1 - ei(f, 529, 537);
  return (
    <>
      <div style={abs({ left: 60, right: 60, top: 600, opacity: intro, filter: `blur(${(1 - intro) * 10}px)` })}>
        <Words f={f} size={96} weight={800} align="center" lines={[ws("Uma pergunta", [479, 482]), ws("de impacto?", [490, 502], true)]} />
      </div>
      {f >= 529 && (
        <>
          <div style={abs({ left: 60, right: 60, top: 250 })}>
            <Words f={f} size={64} weight={600} align="center" lines={[ws("Contador", [529])]} />
          </div>
          {/* negação: P&B -> o número fica vermelho; outras paletas -> linha horizontal (nunca risco inclinado) */}
          <div
            className={MONO && strike > 0.5 ? "keep" : undefined}
            style={abs({
              left: 0,
              right: 0,
              top: 330,
              textAlign: "center",
              fontSize: 300,
              fontWeight: 800,
              letterSpacing: -14,
              color: MONO && strike > 0.5 ? NEG_RED.onDark : ACC,
              transform: `scale(${bump})`,
              opacity: e(f, 537, 545) * (MONO ? 1 : 1 - 0.6 * strike),
              filter: `blur(${(1 - e(f, 537, 545)) * 12}px)`,
            })}
          >
            {count || ""}
          </div>
          {!MONO && <DrawLine f={f} at={634} dur={12} width={760} height={120} d="M0 60 L740 60" stroke="#fff" strokeWidth={16} style={{ left: 160, top: 420 }} />}
          <div style={abs({ left: 60, right: 60, top: 660 })}>
            <Words f={f} size={60} weight={600} align="center" lines={[ws("itens na tela", [592, 606, 619])]} />
          </div>
          {/* grade de gravações — cada card abre como barra carregando junto do contador */}
          <div style={abs({ left: 105, top: 1030, width: 870, height: 740, opacity: 1 - 0.75 * strike, filter: `blur(${strike * 3}px)` })}>
            {Array.from({ length: 30 }).map((_, i) => {
              const step = steps.find((s) => i < s.n)!;
              const idx = i - (steps[steps.indexOf(step) - 1]?.n ?? 0);
              return (
                <Box key={i} f={f} at={step.at - 4 + idx} dur={10} radius={16} style={abs({ left: (i % 6) * 146, top: Math.floor(i / 6) * 148, width: 122, height: 132 })}>
                  <div style={abs({ left: 12, top: 12, width: 14, height: 14, borderRadius: 7, background: "#ff4d5e", boxShadow: "0 0 10px #ff4d5e" })} />
                  <div style={abs({ left: 34, top: 4, fontSize: TYPE.caption, fontWeight: 700, color: MUTED })}>REC</div>
                  <svg viewBox="0 0 40 40" width="46" height="46" style={abs({ left: 38, top: 50 })}>
                    <circle cx="20" cy="14" r="9" fill={P.iconFill} />
                    <path d="M4 40 q16 -22 32 0" fill={P.iconFill} />
                  </svg>
                </Box>
              );
            })}
          </div>
          <div style={abs({ left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center", opacity: over })}>
            <Box f={f} at={646} dur={9} radius={24} bg={`linear-gradient(135deg, #fff, ${ICE})`} border="none" glow style={{ padding: "18px 44px" }}>
              <div style={{ color: INK, fontSize: 92, fontWeight: 800, letterSpacing: -3 }}>Resolvido.</div>
            </Box>
          </div>
        </>
      )}
    </>
  );
};

/* ---------------------------------------- 7. GRADE: fotos do rosto que se espalham 773–868 */
export const SGrade: React.FC<{ f: number }> = ({ f }) => {
  const spread = es(f, 803, 825); // as cartas se espalham na palavra-chave
  const faces = [1, 2, 3, 5, 6, 7];
  const W = 290;
  const H = 210;
  return (
    <>
      <Header
        f={f}
        states={[
          { from: 773, to: 836, lines: [ws("Várias", [803]), ws("versões.", [809], true)] },
          { from: 839, to: 999, lines: [ws("Grade de", [834, 839]), ws("imagens.", [853], true)] },
        ]}
        size={70}
      />
      {faces.map((id, i) => {
        const tx = 60 + (i % 3) * (W + 20);
        const ty = 330 + Math.floor(i / 3) * (H + 20);
        const x = interpolate(spread, [0, 1], [395, tx]);
        const y = interpolate(spread, [0, 1], [440, ty]);
        const pa = e(f, 839 + i * 3, 851 + i * 3);
        return (
          <div
            key={i}
            style={abs({
              left: x,
              top: y,
              width: W,
              height: H,
              zIndex: 6 - i,
              opacity: i === 0 ? 1 : spread > 0.02 ? 1 : 0,
              transform: `rotate(${(1 - spread) * (i - 2.5) * 3}deg)`,
            })}
          >
            <Box f={f} at={i === 0 ? 775 : 801} dur={i === 0 ? 16 : 10} radius={22} bg="#000" border={`3px solid ${pa > 0.5 ? ACC : LINE}`} glow={pa > 0.5} style={{ width: W, height: H, overflow: "hidden" }}>
              <Img className="keep" src={staticFile(`img/face${id}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 35%", borderRadius: 20 }} />
              <div
                style={abs({
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 58,
                  borderRadius: "0 0 20px 20px",
                  background: `linear-gradient(transparent, ${INK}ee)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 12px",
                  opacity: pa,
                  transform: `translateY(${(1 - pa) * 30}px)`,
                })}
              >
                <span style={{ fontSize: TYPE.caption, fontWeight: 700 }}>Item 0{i + 1}</span>
              </div>
            </Box>
          </div>
        );
      })}
    </>
  );
};

/* ---------------------------------------- 8. PIPELINE: 3 etapas com setas 868–961 */
export const SPipeline: React.FC<{ f: number }> = ({ f }) => {
  const nodes = [
    { at: 875, t: "Passo 1", img: "aviao" },
    { at: 899, t: "Passo 2", img: "ab" },
    { at: 920, t: "Passo 3", img: "foguete" },
  ];
  return (
    <>
      <div style={abs({ left: 70, right: 70, top: 118 })}>
        <Words f={f} size={80} weight={800} lines={[[{ t: "Um.", at: 875 }, { t: "Dois.", at: 899 }, { t: "Três.", at: 920, accent: true }]]} />
        <div style={{ marginTop: 10 }}>
          <Words f={f} size={48} weight={500} lines={[ws("etapas do processo.", [930, 935, 940])]} />
        </div>
      </div>
      {[0, 1].map((i) => (
        <DrawLine key={i} f={f} at={nodes[i + 1].at - 14} dur={10} width={120} height={20} d="M0 10 L110 10" arrow dash style={{ left: 330 + i * 320, top: 548 }} />
      ))}
      {nodes.map((n, i) => {
        const last = i === 2;
        return (
          <Box
            key={n.t}
            f={f}
            at={n.at - 6}
            dur={10}
            radius={36}
            bg={last ? `linear-gradient(160deg, ${P.navyBright}, ${NAVY})` : undefined}
            border={`3px solid ${f >= n.at + 6 ? ACC : LINE}`}
            glow={f >= n.at + 6}
            style={abs({ left: 90 + i * 320, top: 390, width: 260, height: 330 })}
          >
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 26, gap: 14 }}>
              <Obj name={n.img} f={f} at={n.at} h={200} />
              <div style={{ fontSize: 34, fontWeight: 800 }}>{n.t}</div>
            </div>
          </Box>
        );
      })}
    </>
  );
};

/* ---------------------------------------- 9. IMPACTO: palavra forte + vídeo adicional (full) 961–1017 */
export const SImpacto: React.FC<{ f: number }> = ({ f }) => {
  const a = 1 - ei(f, 971, 978);
  const shake = f >= 969 && f < 976 ? Math.sin(f * 3.1) * (976 - f) * 1.4 : 0;
  const clip = e(f, 963, 979);
  return (
    <>
      <div style={abs({ left: 50, right: 50, top: 330, opacity: a, filter: `blur(${(1 - a) * 10}px)` })}>
        <Words f={f} size={80} weight={600} align="center" lines={[ws("Momento de", [961, 965])]} />
        <div
          style={{
            marginTop: 6,
            textAlign: "center",
            fontSize: 180,
            fontWeight: 800,
            letterSpacing: -9,
            color: ACC,
            textShadow: `0 0 50px ${ACC}88`,
            opacity: e(f, 966, 971),
            transform: `scale(${0.7 + 0.3 * pop(f, 966, 9)}) translateX(${shake}px)`,
          }}
        >
          IMPACTO.
        </div>
      </div>
      {f >= 977 && (
        <div style={abs({ left: 60, right: 60, top: 360 })}>
          <Words f={f} size={100} weight={800} align="center" lines={[ws("A virada", [977, 980], true), ws("do vídeo…", [991, 997])]} />
        </div>
      )}
      {/* comercial: os clones viram criativos */}
      <Box f={f} at={963} dur={11} radius={30} bg="#000" border={`2px solid ${LINE}`} glow style={abs({ left: 40, right: 40, top: 800, height: 430, overflow: "hidden" })}>
        <div style={{ width: "100%", height: "100%", borderRadius: 28, overflow: "hidden", transform: `scale(${1.08 - 0.08 * clip})` }}>
          {CONFIG.BROLL ? (
            <Sequence from={toOut(961)} durationInFrames={toOut(1017) - toOut(961)} layout="none">
              <OffthreadVideo className="keep" src={staticFile("comercial.mp4")} startFrom={1620} playbackRate={SPEED} muted style={{ width: 1000, height: 430, objectFit: "cover" }} />
            </Sequence>
          ) : (
            <div style={{ width: 1000, height: 430, background: `linear-gradient(135deg, ${P.panel2}, #000)` }} />
          )}
        </div>
      </Box>
      <div style={abs({ left: 70, top: 1260, opacity: e(f, 975, 985) })}>
        <Chip>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: ACC, boxShadow: GLOW }} /> Vídeo adicional
        </Chip>
      </div>
    </>
  );
};

/* ---------------------------------------- 11. DASHBOARD: painel com métricas e curva 1113–1249 */
export const SDashboard: React.FC<{ f: number }> = ({ f }) => {
  const pts = [
    [0, 0.12], [0.15, 0.16], [0.3, 0.14], [0.45, 0.3], [0.6, 0.38], [0.75, 0.62], [0.9, 0.78], [1, 0.95],
  ];
  const W = 820;
  const H = 180;
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x * W} ${H - y * H}`).join(" ");
  const area = es(f, 1210, 1240);
  return (
    <>
      <Header
        f={f}
        states={[
          { from: 1113, to: 1196, lines: [ws("Painel.", [1157], true)] },
          { from: 1196, to: 999999, lines: [ws("Resultado", [1198], true), ws("subindo.", [1230])] },
        ]}
        size={72}
      />
      <Box f={f} at={1115} dur={12} radius={34} style={abs({ left: 60, right: 60, top: 300, height: 480, overflow: "hidden" })}>
        <div style={{ height: 70, display: "flex", alignItems: "center", gap: 12, padding: "0 28px", borderBottom: `1px solid ${LINE}` }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: LINE }} />
          ))}
          <div style={{ marginLeft: 16, fontSize: TYPE.caption, fontWeight: 600 }}>Painel</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <div style={{ opacity: e(f, 1155, 1165), transform: `scale(${pop(f, 1155)})` }}>
              <Chip style={{ fontSize: 24, padding: "6px 14px" }}>
                <Logo size={26} /> Ferramenta A
              </Chip>
            </div>
            <div style={{ opacity: e(f, 1162, 1172), transform: `scale(${pop(f, 1162)})` }}>
              <Chip style={{ padding: "6px 14px" }}>
                <Wordmark size={26} />
              </Chip>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, padding: "22px 28px 0" }}>
          {[
            { k: "Métrica 1", v: "3", at: 1126 },
            { k: "Métrica 2", v: "6", at: 1160 },
            { k: "Métrica 3", v: "↑ subindo", at: 1212, hi: true },
          ].map((c) => (
            <Box key={c.k} f={f} at={c.at} dur={12} radius={18} bg={PANEL2} border={`1px solid ${c.hi && f > c.at + 10 ? ACC : LINE}`} style={{ flex: 1, height: 100, padding: "14px 18px" }}>
              <div style={{ fontSize: TYPE.caption, color: MUTED }}>{c.k}</div>
              <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6, color: c.hi ? ACC : "#fff" }}>{c.v}</div>
            </Box>
          ))}
        </div>
        <svg width={W} height={H + 30} style={abs({ left: 40, top: 240, overflow: "visible" })}>
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={ACC} stopOpacity="0.35" />
              <stop offset="1" stopColor={ACC} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={0} x2={W * e(f, 1130 + i * 3, 1146 + i * 3)} y1={10 + i * 55} y2={10 + i * 55} stroke={LINE} strokeWidth="1" />
          ))}
          <path d={`${d} L${W} ${H} L0 ${H} Z`} fill="url(#area)" opacity={area} />
        </svg>
        <DrawLine f={f} at={1196} dur={40} width={W} height={H} d={d} strokeWidth={7} style={{ left: 40, top: 240 }} />
        <div style={abs({ left: 40 + W - 13, top: 240 + H - 0.95 * H - 13, width: 26, height: 26, borderRadius: 13, background: ACC, boxShadow: GLOW, transform: `scale(${pop(f, 1234)})` })} />
      </Box>
    </>
  );
};

/* ---------------------------------------- 12a. CHECKLIST: objeto 3D + passos 1249–1392 */
export const SChecklist: React.FC<{ f: number }> = ({ f }) => {
  const items = [
    { t: "Primeiro passo", at: 1310 },
    { t: "Segundo passo", at: 1322 },
    { t: "Terceiro passo", at: 1359 },
  ];
  return (
    <>
      <Header
        f={f}
        states={[
          { from: 1249, to: 1305, lines: [ws("Chamada para ação?", [1262, 1275, 1275], true)] },
          { from: 1305, to: 999999, lines: [ws("Um checklist", [1292, 1300]), ws("passo a passo.", [1310, 1330, 1330], true)] },
        ]}
        size={72}
      />
      <div style={abs({ left: 60, top: 300, width: 380, height: 470, display: "flex", alignItems: "center", justifyContent: "center" })}>
        <div style={abs({ inset: 30, borderRadius: "50%", background: `radial-gradient(circle, ${ACC}40, transparent 70%)`, opacity: e(f, 1272, 1290) })} />
        <Obj name="guia" f={f} at={1272} h={420} />
      </div>
      <div style={abs({ left: 470, top: 330, right: 60 })}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, opacity: e(f, 1306, 1316) }}>
          <Obj name="engrenagem" f={f} at={1306} h={70} float={false} />
          <span style={{ fontSize: TYPE.caption, color: MUTED, fontWeight: 600 }}>Passo a passo</span>
        </div>
        {items.map((it) => {
          const ok = pop(f, it.at + 10, 10);
          return (
            <Box key={it.t} f={f} at={it.at} dur={10} radius={18} style={{ padding: "18px 18px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: TYPE.caption, fontWeight: 600 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: ACC, boxShadow: GLOW, color: INK, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${ok})`, flexShrink: 0 }}><Icon name="check" size={24} weight={3.2} color={INK} /></div>
                {it.t}
              </div>
            </Box>
          );
        })}
      </div>
    </>
  );
};
