import React from "react";
import { interpolate } from "remotion";
import { ACC, Bar, Box, Chip, clamp, e, ei, es, GLOW, Header, Wordmark, Icon, INK, LINE, MUTED, Obj, pop, ws, P, NAVY, ICE, SAFE, TYPE } from "./ui";
import { camera } from "./camera";

// Cenas do modo "rosto": o vídeo ocupa a tela; a animação vive na base,
// sobre o degradê, em material translúcido e dentro da área segura do Reels
// (HEAD_TOP..SAFE.bottom; à direita, fora da coluna de botões). Frames globais a 30 FPS.

const abs = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
const HEAD_TOP = 1110; // título do overlay
const CARD_TOP = 1300; // cartão (termina antes de SAFE.bottom)
const CARD_X = { left: SAFE.left, right: SAFE.rightLow };

/* ------------------------------------------------------------ 1. HOOK 0–91 */
export const SHook: React.FC<{ f: number }> = ({ f }) => {
  const items = [
    { at: 10, label: "Opção A", img: "loja" },
    { at: 39, label: "Opção B", img: "empresa" },
    { at: 70, label: "Opção C", img: "produto" },
  ];
  const active = f >= 76 ? 2 : f >= 43 ? 1 : 0;
  return (
    <>
      <Header top={HEAD_TOP} size={64} f={f} states={[{ from: 0, to: 999, lines: [ws("Seu gancho", 0, false, 3), ws("em destaque:", 9, true)] }]} />
      {items.map((it, i) => {
        const on = i === active;
        return (
          <Box
            key={i}
            f={f}
            at={it.at}
            dur={10}
            radius={30}
            material
            glow={on}
            style={abs({ left: SAFE.left + i * 297, top: CARD_TOP, width: 276, height: 250, outline: on ? `3px solid ${ACC}` : undefined, outlineOffset: -3, borderRadius: 30 })}
          >
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 24, gap: 14 }}>
              <Obj name={it.img} f={f} at={it.at + 6} h={140} />
              <div style={{ fontSize: TYPE.caption, fontWeight: 700, color: on ? ACC : "#fff" }}>{it.label}</div>
            </div>
          </Box>
        );
      })}
    </>
  );
};

/* ---------------------------------------- 6. IDENTIDADE 657–773 (face tracking) */
const Corner: React.FC<{ x: number; y: number; r: number; flipX?: boolean; flipY?: boolean; color: string }> = ({ x, y, r, flipX, flipY, color }) => (
  <div
    style={abs({
      left: x - (flipX ? r : 0),
      top: y - (flipY ? r : 0),
      width: r,
      height: r,
      borderTop: flipY ? undefined : `6px solid ${color}`,
      borderBottom: flipY ? `6px solid ${color}` : undefined,
      borderLeft: flipX ? undefined : `6px solid ${color}`,
      borderRight: flipX ? `6px solid ${color}` : undefined,
      borderRadius: 14,
      filter: `drop-shadow(0 0 10px ${color})`,
    })}
  />
);

export const SIdentidade: React.FC<{ f: number }> = ({ f }) => {
  const { faceScreen: fc } = camera(f);
  const lock = pop(f, 684, 14); // colchetes "travam" no rosto
  const scan = interpolate(f, [715, 758], [0, 1], clamp);
  const done = f >= 760;
  const grow = 1 + 0.35 * (1 - lock);
  const w = fc.size * 1.05 * grow;
  const h = fc.size * 1.3 * grow;
  const L = fc.x - w / 2;
  const T = fc.y - h / 2 - fc.size * 0.08;
  const col = done ? ACC : "#ffffff";
  const vis = e(f, 684, 694) * (1 - ei(f, 764, 772));
  const steps = [
    { t: "Etapa 1", at: 690 },
    { t: "Etapa 2", at: 724 },
    { t: "Pronto", at: 760 },
  ];
  return (
    <>
      {/* colchetes seguem o rosto real (face tracking) */}
      <div style={{ opacity: vis }}>
        <Corner x={L} y={T} r={80} color={col} />
        <Corner x={L + w} y={T} r={80} flipX color={col} />
        <Corner x={L} y={T + h} r={80} flipY color={col} />
        <Corner x={L + w} y={T + h} r={80} flipX flipY color={col} />
        {f >= 715 && f < 762 && <div style={abs({ left: L + 10, width: w - 20, top: T + scan * h - 3, height: 5, background: ACC, boxShadow: GLOW, borderRadius: 3 })} />}
        {[
          [0.3, 0.38], [0.7, 0.38], [0.5, 0.55], [0.36, 0.72], [0.64, 0.72], [0.5, 0.22], [0.2, 0.55], [0.8, 0.55],
        ].map(([px, py], i) => (
          <div
            key={i}
            style={abs({
              left: L + px * w - 6,
              top: T + py * h - 6,
              width: 12,
              height: 12,
              borderRadius: 6,
              background: ACC,
              boxShadow: GLOW,
              opacity: f >= 715 && scan > py - 0.05 ? 1 - ei(f, 758, 766) : 0,
            })}
          />
        ))}
      </div>
      <div style={abs({ left: L, top: Math.max(40, T - 70), opacity: e(f, 690, 700) * (1 - ei(f, 764, 772)) })}>
        <Chip on={done}>
          {done ? <><Icon name="check" size={30} weight={3} /> Rosto reconhecido</> : f >= 715 ? "Mapeando traços…" : "Rosto detectado"}
        </Chip>
      </div>

      {/* overlay inferior */}
      <Header
        top={HEAD_TOP}
        size={64}
        f={f}
        states={[
          { from: 657, to: 715, lines: [ws("Reconhecimento", [657]), ws("de rosto…", [681, 681], true)] },
          { from: 715, to: 999, lines: [ws("Colchetes que", [715, 724]), ws("seguem o rosto.", [744, 752, 760], true)] },
        ]}
      />
      <Box f={f} at={662} dur={11} radius={30} material style={abs({ ...CARD_X, top: CARD_TOP, height: 250, padding: "22px 28px" })}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Wordmark size={30} />
          <span style={{ fontSize: TYPE.caption, color: MUTED }}>/ exemplo</span>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 24 }}>
          {steps.map((s, i) => {
            const p = e(f, s.at, s.at + 10);
            const ok = f >= (steps[i + 1]?.at ?? 760);
            return (
              <div key={s.t} style={{ flex: 1, display: "flex", gap: 10, alignItems: "center", opacity: 0.3 + 0.7 * p, fontSize: TYPE.caption, fontWeight: 600 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    borderRadius: 17,
                    border: `3px solid ${ok ? ACC : P.ring}`,
                    background: ok ? ACC : "transparent",
                    boxShadow: ok ? GLOW : undefined,
                    color: INK,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {ok ? <Icon name="check" size={22} weight={3.4} color={INK} /> : null}
                </div>
                <span style={{ color: i === 2 && ok ? ACC : "#fff" }}>{s.t}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 30 }}>
          <Bar f={f} at={676} fillAt={684} fillDur={76} value={1} height={14} />
        </div>
      </Box>
    </>
  );
};

/* ---------------------------------------- 10. ÊNFASE: frase + barra que cai 1017–1113 */
export const SEnfase: React.FC<{ f: number }> = ({ f }) => {
  const bar = 1 - es(f, 1045, 1064); // a barra cai para zero na palavra-chave
  return (
    <>
      <Header
        top={HEAD_TOP}
        size={64}
        f={f}
        states={[{ from: 1017, to: 999999, lines: [ws("Frase de ênfase.", [1017, 1020, 1023], true), ws("Com uma barra que cai.", [1034, 1037, 1041, 1045, 1045])] }]}
      />
      <Box f={f} at={1021} dur={11} radius={30} material style={abs({ ...CARD_X, top: CARD_TOP, height: 250, padding: "24px 30px" })}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: TYPE.caption, width: 620 }}>
          <span>Indicador</span>
          <span style={{ color: ACC, fontWeight: 800 }}>{Math.round(bar * 72 * e(f, 1028, 1042))}%</span>
        </div>
        <div style={{ marginTop: 16, width: 620 }}>
          <Bar f={f} at={1026} fillAt={1030} fillDur={12} value={Math.max(0.02, 0.72 * bar)} height={28} color={P.soft} />
        </div>
        <div style={{ marginTop: 26, display: "flex", gap: 12 }}>
          {["Pergunta 1?", "Pergunta 2?", "Pergunta 3?"].map((t, i) => (
            <div key={t} style={{ opacity: e(f, 1088 + i * 4, 1098 + i * 4), transform: `translateY(${(1 - pop(f, 1088 + i * 4)) * 24}px)` }}>
              <Chip>{t}</Chip>
            </div>
          ))}
        </div>
        <div style={abs({ right: 0, top: -30 })}>
          <Obj name="megafone" f={f} at={1093} h={230} />
        </div>
      </Box>
    </>
  );
};

/* ---------------------------------------- 12b. CTA 1392–1449 (gravação 100% + pop-ups de comentário) */
const Avatar: React.FC<{ letter: string; color: string; size?: number }> = ({ letter, color, size = 54 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, ${NAVY})`,
      border: "2px solid #ffffffaa",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.44,
      fontWeight: 800,
      color: "#fff",
    }}
  >
    {letter}
  </div>
);

const Bubble: React.FC<{ f: number; at: number; user: string; text: string; letter: string; color: string; heart?: number }> = ({
  f,
  at,
  user,
  text,
  letter,
  color,
  heart,
}) => {
  const p = pop(f, at, 10);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 30px 14px 14px",
        borderRadius: 40,
        background: P.bubbleBg,
        border: `1px solid ${ACC}55`,
        boxShadow: "0 12px 30px #0008",
        opacity: e(f, at, at + 6),
        transform: `translateY(${(1 - p) * 30}px) scale(${0.8 + 0.2 * p})`,
        transformOrigin: "left center",
        marginTop: 14,
        alignSelf: "flex-start",
      }}
    >
      <Avatar letter={letter} color={color} size={68} />
      <div>
        <div style={{ fontSize: TYPE.caption, color: P.sub, fontWeight: 600 }}>{user}</div>
        <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: -0.5 }}>{text}</div>
      </div>
      {heart !== undefined && (
        <div style={{ marginLeft: 10, transform: `scale(${pop(f, heart, 10)})` }}><Icon name="heart" size={34} color={ACC} /></div>
      )}
    </div>
  );
};

const KEY = "QUERO"; // palavra do CTA ("comenta a palavra …")
const CTA_TOP = 1440; // campo de comentário: acima da legenda do app e fora da coluna de botões
export const SCta: React.FC<{ f: number }> = ({ f }) => {
  const { faceScreen: fc } = camera(f);
  const typed = KEY.slice(0, Math.floor(interpolate(f, [1404, 1412], [0, KEY.length], clamp)));
  const send = 1416;
  const sent = f >= send;
  const composerOut = ei(f, send, send + 6);
  // pilha de comentários ancorada ao lado do rosto (face tracking)
  const left = 50;
  const bottom = Math.min(CTA_TOP - 30, fc.y + fc.size * 0.62);
  return (
    <>
      <div style={abs({ left, top: bottom - 520, width: 620, height: 520, display: "flex", flexDirection: "column", justifyContent: "flex-end" })}>
        {sent && <Bubble f={f} at={send} user="@voce" text={KEY} letter="V" color={ICE} heart={send + 8} />}
        <Bubble f={f} at={1428} user="@loja.exemplo" text={`${KEY} 🙌`} letter="L" color={P.soft} />
        <Bubble f={f} at={1436} user="@oviniciusply" text={KEY} letter="O" color={ACC} heart={1442} />
      </div>
      {/* campo de comentário: aparece em "manda a palavra", digita a palavra do CTA e envia */}
      <div
        style={abs({
          left: SAFE.left,
          right: SAFE.rightLow,
          top: CTA_TOP,
          height: 104,
          borderRadius: 52,
          background: P.overlayBg,
          border: `2px solid ${typed ? ACC : "#ffffff44"}`,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "0 14px 0 14px",
          opacity: e(f, 1394, 1401) * (1 - composerOut),
          transform: `translateY(${(1 - e(f, 1394, 1402)) * 40 + composerOut * 20}px)`,
          boxShadow: typed ? `0 0 30px ${ACC}55` : "0 12px 30px #0008",
        })}
      >
        <Avatar letter="V" color={ICE} size={70} />
        <div style={{ flex: 1, fontSize: 34, fontWeight: 700, color: typed ? "#fff" : P.placeholder }}>
          {typed || "Adicione um comentário…"}
          {typed && <span style={{ color: ACC, opacity: Math.floor(f / 6) % 2 ? 1 : 0.3 }}>│</span>}
        </div>
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 38,
            background: typed ? ACC : "#ffffff22",
            color: INK,
            fontSize: 38,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${1 - 0.15 * Math.max(0, 1 - Math.abs(f - send) / 3)})`,
          }}
        >
          <Icon name="arrowUp" size={34} weight={3} color={INK} />
        </div>
      </div>
    </>
  );
};
