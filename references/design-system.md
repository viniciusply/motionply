# MotionPly · Sistema de design (vale para as duas modalidades)

Direção: nível de polimento, contenção e legibilidade de um produto Apple, aplicado a **vídeo vertical
narrado** — sem copiar a marca nem a interface da Apple. A identidade da skill continua a mesma:
preto e branco com alternância claro/escuro, abertura "barra carregando", marcador nas palavras-chave.

Referências consultadas (Human Interface Guidelines, set/2026): Typography, Motion, Color, Accessibility,
Materials, Dark Mode, Layout — developer.apple.com/design/human-interface-guidelines/.
As regras abaixo são a tradução prática delas para 1080×1920. Tokens em `template/src/ui.tsx`.

## 1. Escala física

Um vídeo 1080 px de largura aparece num iPhone com ~390 pt → **1 pt ≈ 2,77 px**.
HIG: texto mínimo 11 pt, padrão 17 pt → no vídeo:

| Token (`TYPE`) | px | Uso |
|---|---|---|
| `caption` | **30 (mínimo absoluto)** | rótulos de eixo, metadados, chips |
| `body` | 36 | texto corrido de interface |
| `callout` | 44 | destaque em cartão |
| `title` | 56 | título de cartão |
| `headline` | 72 | título de cena (split) |
| `display` | 96+ | tela cheia, números |

**Nunca abaixo de 30 px.** Se não couber, corte palavras — não diminua o corpo.

## 2. Tipografia

- Poucas famílias: **Inter** (sans, papel do SF) em tudo; na Tipografia Motion, + **Instrument Serif itálico**
  (papel do New York) só para contraste. Nada além disso (HIG: "minimize the number of typefaces").
- **Tracking óptico** (`tracking(size)`): ≥ 80 px −3,5%; 48–80 −2,5%; 36–48 −1,2%; 30–36 −0,4%; menor +1%.
  Corpo grande aperta, corpo pequeno respira — como o SF faz.
- Pesos: 600–900 em vídeo. Evitar pesos finos (HIG: "avoid light font weights").
- Hierarquia por **tamanho + peso + cor** (primário branco, secundário `MUTED` #98989F), não por efeitos.

## 3. Cor e contraste

- Neutros no estilo dos cinzas de sistema: superfícies `#1C1C1E` / `#2C2C2E`, divisórias `#3A3A3C`,
  texto secundário `#98989F`. Contraste de texto **≥ 4,5:1** (meta 7:1 em texto pequeno) — medir ao criar tokens.
- **Branco suavizado** `#F5F5F7` no modo claro e nos cartões brancos; tinta quase-preta `#1D1D1F` sobre ele
  (HIG Dark Mode: branco puro "brilha" num contexto escuro).
- Mesma cor = mesmo significado: branco cheio/marcador = **a** informação principal do beat.
- Nunca só cor para diferenciar (gráficos sempre com rótulo; destaque com rótulo + marcador).

### 3.1 Negação ("não tem", "nunca mais", "isso não significa")

- **Proibido risco inclinado/diagonal** sobre palavras ou números (fica amador).
- Paleta **preto e branco** → a palavra negada fica **vermelha** (`NEG_RED`: #FF453A sobre escuro,
  #D70015 sobre claro — vermelhos de sistema), sem linha. Em cena `light`, use `className="keep"` no
  elemento vermelho para o filtro de inversão não trocar a cor.
- **Outras paletas** → linha **horizontal** atravessando a palavra na altura do meio das letras.
- Tipografia Motion: marcação `~palavra~` já faz isso sozinha (Type.tsx). Edição Motion: `MONO` e `NEG_RED` em ui.tsx.

## 4. Superfícies e profundidade

- **Sem brilho neon** (glow colorido em barras, linhas, pontos, objetos) — é a principal "cara de IA".
  `GLOW` agora é uma sombra neutra de elevação.
- Cartões sobre o vídeo (modo rosto, CTA): **material translúcido** (`<Box material>`: blur 30 px +
  saturação + escurecimento ~55%, borda fina `HAIRLINE` 14% branco) — separa do vídeo sem esconder a cena
  (HIG Materials: sobre mídia, material claro com camada de escurecimento ~35%+).
- Raios coerentes: 16 (chip/célula), 24–30 (cartão), 34–40 (painel grande). Cartões em tela usam sombra
  só quando precisam se destacar (`glow` = elevação).

## 5. Ícones

- Usar o componente `Icon` (traço uniforme, cantos arredondados, no espírito do SF Symbols):
  `check`, `xmark`, `arrowUp`, `arrowRight`, `chevronDown`, `play`, `heart`, `dot`, `bolt`.
- **Não usar glifos de texto** (✓ ✕ ↑ ● ♥) — cada fonte desenha diferente e o peso não casa com o texto.
- Tamanho do ícone ≈ altura das maiúsculas do texto ao lado; peso do traço acompanha o peso da fonte.

## 6. Movimento

HIG Motion: movimento com propósito, breve e preciso; nada de animação gratuita.
- Toda animação comunica algo (entrada de informação, mudança de estado, ênfase). Mantidos: abertura
  "barra carregando" (identidade), revelação de palavras, morph, contadores.
- **Removidos**: brilho correndo em loop nas barras, objetos flutuando sem parar, quique exagerado no pop
  (agora assenta curto: bezier 0.34, 1.22, 0.64, 1).
- Durações curtas (entrada 8–12 frames, saída 6–7). Nada pisca (o cursor de digitação é a única exceção).

## 7. Área segura (Reels / TikTok / Shorts)

A interface do app cobre partes do vídeo. Tokens `SAFE`:
- **Topo** até y 180 (status, abas) — nada de texto.
- **Base** a partir de y 1560 (legenda, @, áudio) — nada de texto ou cartão.
- **Direita, metade de baixo** (y > ~1100): coluna de botões — cartões terminam a 150 px da borda (`SAFE.rightLow`).
- Modo rosto: título do overlay em y 1110, cartão em y 1300–~1550, à esquerda da coluna de botões.
- CTA: campo de comentário em y 1440, fora da coluna de botões.

## 8. Checklist de acabamento (rodar antes de todo render)

1. Nenhum `fontSize` < 30 (`grep -nE "fontSize: ?(1[0-9]|2[0-9])\b" src`).
2. Nenhum glifo de texto como ícone; nenhum glow colorido.
3. Contraste de todo texto ≥ 4,5:1 (texto sobre vídeo sempre com véu/material).
4. Nada importante fora da área segura; olhos e boca livres.
5. Stills nos estados legíveis de cada cena (texto quebrando linha? acento cortado? rótulo encostando?).
6. Marcador: faixa contínua, sem frestas, acentos (Ã, É) inteiros durante a revelação.
7. Nenhum risco inclinado: negação = vermelho (P&B) ou linha horizontal (outras paletas).
