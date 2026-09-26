# MotionPly · Tipografia Motion

Segunda modalidade de edição da skill. Mesmo nível de acabamento da **Edição Motion** (modalidade 1),
mas **sem ilustrações, gráficos, interfaces ou imagens**: o vídeo fica em tela cheia o tempo todo e o
ritmo vem de **tipografia editorial**, **cortes de enquadramento** (zoom in / zoom out), **espelhamento**,
**socos de zoom** e **face tracking pontual**.

> **Régua de qualidade** (padrão aprovado em produção): densidade de ~1 beat por frase, mistura
> tipográfica em todo bloco (sans forte + serifa itálica + no máx. 1 marcador), ~4 momentos de face tracking,
> ~4 espelhamentos, ~4 cartões alternando preto/branco num reel de ~50 s. O roteiro de demonstração
> `template/src/tipo/roteiro.ts` mostra essa densidade.

Código: `template/src/tipo/` (composição `TipoVideo`, render `npm.cmd run render:tipo`).
Tudo o que vale para a modalidade 1 sobre **decupagem do bruto, preparação, velocidade, verificação e
Windows** (padrao-lapidado.md seções 2, 2.1, 10, 11) vale aqui igual.

| | Edição Motion (1) | Tipografia Motion (2) |
|---|---|---|
| Composição | `MeuVideo` | `TipoVideo` |
| Roteiro | `timeline.ts` + `Scenes.tsx` / `FaceScenes.tsx` | `tipo/roteiro.ts` (só dados) |
| Visual | ilustrações, gráficos, interfaces, objetos 3D | só vídeo + tipografia |
| Tela | split / full / face / cam | vídeo 100% + cartões tipográficos cheios |
| Câmera | segue o rosto o tempo todo nos modos face/cam | **corte de enquadramento por frase**; tracking só em 2–5 momentos |
| Claro/escuro | cenas `light` | cartões **pretos e brancos** alternados |
| Tempo de produção | alto | baixo (roteiro em dados, sem desenhar cenas) |

---

## 1. Quando usar

- Conteúdo de opinião, notícia, dica rápida, storytelling — a força está na **fala** e no **rosto**.
- O usuário pede "edição mais simples", "só tipografia", "dinâmica com zoom", "sem tantos gráficos".
- Prazo curto: o roteiro é só uma lista de beats; não há cenas para desenhar.

## 2. Linguagem de câmera (camTipo.ts)

O vídeo master é contínuo (a voz nunca reinicia); a câmera muda **no início de cada frase**, como um jump cut.

| Campo | Efeito | Regra de uso |
|---|---|---|
| `zoom` | enquadramento do beat: `1` aberto, `1.15–1.3` fechado | **alternar aberto ↔ fechado a cada frase** — é o que dá o dinamismo |
| `move: "pushIn"` | aproxima devagar (+14%) durante o beat | explicação, tensão, construção |
| `move: "pullOut"` | afasta devagar | conclusão, respiro, fechamento |
| `mirror: true` | espelha a imagem (corte seco); o texto **nunca** espelha | 1 a cada ~3–4 beats; nunca dois seguidos; evite se houver texto/logo legível no fundo ou na roupa |
| `punch: [frames]` | soco de zoom +14% (entra em 5 frames, segura ~10, volta em 10) | palavra de ênfase; 1 por beat no máximo |
| `track: true` | **face tracking**: a câmera segue o rosto (centro suavizado ±6 frames) | só em **momentos de atenção**: gancho ("você não vai acreditar"), virada ("mas calma"), revelação, pergunta, CTA — **2 a 5 por vídeo, nunca no vídeo todo**; use com `zoom ≥ 1.2` |

Sem `track`, o zoom é ancorado no rosto do 1º frame do beat e **fica parado** — enquadramento estável.
Todo corte entra 4% mais perto e assenta em 6 frames (energia no corte). A abertura (frame 0) começa colada e abre.

## 3. Tipografia (Type.tsx)

Cada beat tem um bloco de texto; cada linha é **encaixada na largura** (940 px) medindo a largura real depois
que as fontes carregam — linhas curtas ficam enormes, linhas longas ficam menores: a hierarquia sai sozinha.

Marcação nas linhas do roteiro:

| Marcação | Resultado | Uso |
|---|---|---|
| `PALAVRA` | Inter Black, entrelinha apertada | a ideia principal (prefira CAIXA-ALTA) |
| `*palavras*` | serifa itálica (Instrument Serif) | conectivos, tom de voz, contraste elegante |
| `[palavras]` | marcador: faixa contínua que abre como barra carregando | **a** palavra-chave do beat (1 por beat) |
| `_palavras_` | contorno (outline) | repetição, eco, ênfase secundária |
| `~palavras~` | **negação**: em preto e branco a palavra fica **vermelha** (sem linha); em outras paletas, linha **horizontal** atravessando | "não tem", "não é isso", "nunca mais" — **nunca risco inclinado** |

Estilos de bloco: `style: "stack"` (padrão, pôster de 1–3 linhas) ou `style: "rsvp"` (uma palavra por vez,
enorme, no mesmo lugar — frases rápidas de 3–5 palavras). `align: "left" | "center"`, `pos: "top" | "center"`,
`max` = teto do corpo em px (padrão 230; 300 no rsvp).

**Sincronia automática:** cada palavra do roteiro procura a mesma palavra falada (words.ts) dentro do beat
e entra ~2 frames antes dela. Palavras editoriais (não faladas) entram logo depois da anterior.
Por isso **corrija nomes próprios no words.ts antes** de escrever o roteiro.

Animação: cada palavra sobe de dentro de uma máscara (easeOutQuint, 9 frames); serifa entra com leve blur;
o bloco sai em 6 frames (sobe + blur). Nada de palavra quicando.

Regras de escrita:
- 1–3 linhas por bloco, **máx. ~6 palavras visíveis**; o texto sintetiza a fala, não transcreve.
- Mistura por bloco: 1 linha forte (sans) + 1 serifa + no máx. 1 marcador.
- Números e valores sempre como número ("US$ 1 BI", "10 MESES", "+30 MILHÕES").
- Texto no terço superior (y ≈ 200–750) com véu escuro no topo; **nunca cobrir olhos e boca**.
- As skills complementares de tipografia/escrita/emojis do usuário, quando instaladas, mandam no texto.

Acabamento: [design-system.md](design-system.md) — cartão branco em `#F5F5F7` com tinta `#1D1D1F`; texto só
entre y 180 e 1560 (área segura); revelação do marcador não corta acentos.

## 4. Cartões tipográficos (`card`)

Tela cheia `"black"` ou `"white"` com o texto centralizado; o vídeo some (a voz continua) e o cartão entra
com respiro de escala de 4%. É a **alternância claro/escuro** desta modalidade.
- 2–4 por vídeo, **alternando preto e branco**; 1–3,5 s cada.
- Use nos números grandes, teses e negações (`~negação~` → vermelho no P&B).
- Nunca no gancho nem no CTA (aí o rosto manda).

## 5. Ritmo de um reel de ~50 s

- ~18–22 beats (um por frase / meia-frase), 1,5–4 s cada.
- 2–5 `track`, 3–5 `mirror`, 4–6 `punch`, 2–4 `card`.
- Nunca mais de ~5 s com o mesmo enquadramento.
- CTA: `track` + texto curto ("*comenta*" / "[PALAVRA]"). Se o usuário quiser pop-ups de comentário,
  reaproveitar o `SCta`/`Bubble` da modalidade 1 sobre o vídeo.

## 6. Fluxo de produção

1. Questionário (inclui a pergunta da **modalidade**). Nesta modalidade, a pergunta de imagens não se aplica.
2. Bruto → `rough_cut.py --dry-run` → revisar texto → `render_cut.py` → `prep_video.py` (igual à modalidade 1).
3. Corrigir nomes no `words.ts`; ler `transcricao.txt`.
4. Escrever `src/tipo/roteiro.ts`: beats nos inícios de frase (frames do words.ts) com `cam`, `text`, `card`.
5. `COMP=TipoVideo OUT=<pasta> node stills.mjs <frames>` (frames da composição = fonte ÷ SPEED) e revisar:
   encaixe das linhas, texto fora do rosto, tracking nos momentos certos.
6. `npm.cmd run render:tipo` → `out/tipografia-motion.mp4`.

Roteiro de demonstração: `template/src/tipo/roteiro.ts` (textos genéricos, mostra a marcação e a densidade).

---

## 7. Formato HORIZONTAL 16:9 — gravação de tela + webcam (composição `TelaVideo`)

Para vídeos deitados (YouTube, LinkedIn, tutoriais, "comparando dois vídeos", demonstração de ferramenta).
Mesma linguagem da vertical — corte de enquadramento por frase, socos de zoom, face tracking pontual,
tipografia editorial e cartões preto/branco — adaptada à tela. Render: `npm.cmd run render:tela`.
Roteiro de demonstração: `template/src/tela/roteiroTela.ts` (dois conteúdos lado a lado + webcam).

**Preparação**
1. `rough_cut.py --dry-run` → revisar → `render_cut.py` (a orientação é detectada: sai 1920×1080).
2. `prep_video.py bruto_cortado.mp4` (transcrição; o face tracking dele pode ser ignorado aqui).
3. `python scripts/track_tela.py` → `src/tela/layout.ts`: rastreia **três rostos por frame** —
   `A` (conteúdo da esquerda), `B` (conteúdo da direita) e `CAM` (webcam: o rosto mais abaixo-à-direita).
   Gravações de tela costumam dar zoom e mover janelas; por isso a câmera segue essas posições em vez de
   coordenadas fixas. Confira o rastreamento desenhando as caixas num contact sheet antes de escrever o roteiro.

**Roteiro** (`src/tela/roteiroTela.ts`) — um beat por frase:
| Campo | Valores | Regra |
|---|---|---|
| `shot` | `wide`, `AB` (os dois conteúdos), `A`, `B`, `CAM` | mostre o que a fala aponta ("lado direito" → `B`; "olha o que a IA faz" → `CAM`) |
| `side` | `left`, `right`, `bottom` | lado do texto; o assunto vai para o lado oposto. `bottom` para shots abertos |
| `track` | true | face tracking na webcam — **só** gancho, revelação e fechamento (2–5) |
| `mirror` | true | **só em `CAM`** — espelhar a tela gravada inverte textos de interface |
| `zoom`, `move`, `punch` | como na vertical | |
| `card` | `black` / `white` | 3–4 por vídeo, alternando; negações (`~negação~`), números, conclusão |

**Enquadramento e nitidez:** nos closes a escala vem do **tamanho do rosto** (rosto ~360 px nos conteúdos,
~300 px na webcam), com teto de 2,4× — acima disso a gravação perde nitidez. Véu escuro do lado do texto
(90% → 0) garante contraste sobre a tela gravada. Áreas de texto: esquerda x 110–870, direita x 1050–1810,
base y 800+ (1 linha); cartões centralizados com largura 1400.

**Questionário:** quando o vídeo enviado for deitado, perguntar também o **formato final**:
horizontal 16:9 (esta seção) ou vertical 9:16 (reorganizar tela em cima + webcam embaixo — ainda não
automatizado; montar com shots `A`/`B` no painel de cima e `CAM` embaixo).
