import { WORDS } from "../words";

// Sincronia automática da tipografia com a fala: cada palavra escrita no roteiro
// procura a mesma palavra dita (words.ts) dentro do beat, em ordem. Palavras
// editoriais que não foram ditas entram logo depois da anterior.
// Por isso: corrija nomes próprios no words.ts ANTES de escrever o roteiro.

export const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9$]/g, "");

const LOOKAHEAD = 7; // palavras faladas examinadas à frente (evita casar um "a" lá longe)

export const syncTokens = (tokens: string[], start: number, end: number): number[] => {
  const pool = WORDS.filter((w) => w.s >= start - 8 && w.s < end);
  const out: number[] = [];
  let k = 0;
  let last = start;
  for (const tok of tokens) {
    const n = norm(tok);
    let found = -1;
    if (n) {
      for (let j = k; j < Math.min(pool.length, k + LOOKAHEAD); j++) {
        const m = norm(pool[j].w);
        if (!m) continue;
        const same = m === n || (n.length >= 4 && m.length >= 4 && (m.startsWith(n) || n.startsWith(m)));
        if (same) {
          found = j;
          break;
        }
      }
    }
    if (found >= 0) {
      last = Math.max(last, pool[found].s - 2); // pronta ~2 frames antes da palavra
      k = found + 1;
    } else if (out.length) {
      last += 3;
    }
    out.push(Math.max(start, last));
  }
  return out;
};
