# MotionPly · Edição Motion — como editar cada vídeo novo

Padrão **MotionPly** (por @oviniciusply), lapidado em produção em várias rodadas de ajuste (set/2026).
O mesmo nível de qualidade deve sair em **qualquer vídeo e qualquer computador** — por isso tudo fica dentro da skill.
Ele **prevalece** sobre as orientações genéricas do SKILL.md quando houver conflito. O código-base está em
[`template/`](../template/) e já implementa tudo abaixo.

---

## 1. Questionário inicial (sempre, antes de editar)

Assim que o usuário enviar um vídeo novo, **antes de qualquer edição**, faça as perguntas com a ferramenta
AskUserQuestion (uma chamada, 4 perguntas; a de imagens sai na Tipografia Motion). Não comece a gerar imagens ou gastar créditos antes das respostas.

0. **Modalidade** — "Qual modalidade de edição?"
   - *Edição Motion* — este documento (ilustrações, gráficos, interfaces).
   - *Tipografia Motion* — [tipografia-motion.md](tipografia-motion.md) (tipografia + zoom/espelhamento/face tracking pontual; sem ilustrações). Pule a pergunta 1.
1. **Imagens** — "Deseja usar o Higgsfield para gerar as imagens (objetos 3D do GPT Image, fundo transparente) ou posso fazer ilustrações monocromáticas em SVG/código?"
   - *Gerar com Higgsfield (GPT Image)* — antes, consulte `balance` e `get_cost`; informe custo (≈0,5 crédito por imagem em `quality: medium`) e quantas imagens o saldo permite.
   - *SVG/ícones em código (monocromático)* — sem custo.
2. **Cor do motion** — "Qual a cor do motion?"
   - *Padrão preto e branco* (recomendado) — paleta `mono`, alternando modo escuro e modo claro.
   - *Azul-escuro / azul-claro / branco* — paleta `azul`.
   - *Outra* — criar nova entrada em `PALETTES` (ui.tsx) com os mesmos campos.
   - Em qualquer paleta, **alternar modo claro e escuro** (regra na seção 4).
3. **Vídeo adicional** — "Este conteúdo terá algum vídeo adicional (comercial, B-roll, tela gravada)?"
   - *Sim* — peça o arquivo (colocar em `projeto/public/` ou colar o caminho). Ele entra **mudo**, alternando com o rosto (seção 6).
   - *Não*.
4. **Velocidade do render** — "Em qual velocidade devo renderizar?"
   - *1.2x* (recomendado — 1.0x costuma parecer lento em reels), *1.1x*, *1.0x*, *1.25x*.
   - Vai em `CONFIG.SPEED` (config.ts). A voz é acelerada com pitch preservado; o motion acompanha.

Se o vídeo for **bruto** (sem edição), rode primeiro a decupagem (seção 2.1) — não é preciso perguntar.

Depois da transcrição, **confirme só o que for ambíguo**: a palavra-chave do CTA ("comenta a palavra X") e
nomes próprios e de marcas que o Whisper erra (costumam sair escritos "como se ouve").

---

## 2. Montagem do projeto (funciona em qualquer computador)

Tudo o que a edição precisa está **dentro da pasta da skill** (`template/`: código, scripts, modelo de
detecção facial, objetos 3D). Nada depende de caminhos fixos deste computador. Use `<SKILL>` = pasta onde esta
skill está instalada (a que contém o SKILL.md) e crie o projeto ao lado do vídeo ou na pasta de trabalho do usuário.

```powershell
# Windows PowerShell 5.1: sem "&&" (use ";"); se o npm for bloqueado por política, use npm.cmd / npx.cmd
Copy-Item -Recurse "<SKILL>/template" "<pasta-de-trabalho>/<nome-do-projeto>"
cd "<pasta-de-trabalho>/<nome-do-projeto>"
python scripts/check_env.py                      # confere Python, pacotes, OpenCV YuNet e Node
pip install -r scripts/requirements.txt          # só se o check apontar falta
npm.cmd ci; npm.cmd approve-scripts esbuild      # (macOS/Linux: npm ci)

# A) vídeo BRUTO (sem edição): decupa primeiro — ver seção 2.1
python scripts/rough_cut.py "<bruto>.MOV" --dry-run   # relatório decupagem_bruto.txt para revisar
python scripts/rough_cut.py "<bruto>.MOV"             # gera bruto_cortado.mp4
python scripts/prep_video.py bruto_cortado.mp4

# B) vídeo JÁ CORTADO
python scripts/prep_video.py "<video>.MOV"            # video.mp4, words.ts, faceTrack.ts, img/face*.jpg

python scripts/prep_broll.py "<comercial>.MP4"        # (se houver vídeo adicional) comercial.mp4 mudo + broll_sheet.jpg
```

Na 1ª execução o faster-whisper baixa o modelo `medium` (~1,5 GB) — avise o usuário.

### 2.1 Decupagem de vídeo bruto (`rough_cut.py`)

Estilo de corte medido no vídeo aprovado e replicado pelo script:

| Regra | Valor |
|---|---|
| Início | o 1º frame já contém a **1ª letra** da 1ª palavra (onset de energia − ~1 frame). Se a fala é "amarelo", o vídeo começa no "a". |
| Silêncio / baixo ruído | removidos. Só ficam "ilhas de fala" medidas no áudio (energia acima de ruído + 30% da faixa dinâmica). |
| Pausa dentro da frase | ≤ 0,15 s |
| Pausa em fim de frase/vírgula | ≤ 0,30 s (respiro natural, sem buraco) |
| Tomada repetida / abandonada | em cada pausa, se o que vem depois recomeça pelas últimas palavras de antes, a versão anterior sai — **fica sempre a última tomada** |
| Frase inteira repetida | se reaparece em até 15 s (similaridade ≥ 0,8), a primeira sai |
| Gagueira ("para para") | fica uma |
| Fala não transcrita (murmúrio, ruído) | sai junto com o silêncio |
| Emendas | alinhadas a frames de 30 FPS; micro-fade de 6 ms no áudio |
| Fim | última palavra + 0,35 s |

Detalhes que importam (aprendidos nos testes):
- Transcrever **cada bloco de fala separadamente** — no arquivo inteiro o Whisper funde tomadas repetidas numa só e o erro fica invisível.
- Não confiar no tempo da 1ª palavra do Whisper (costuma vir adiantado ~0,5 s): ancorar no início da ilha de fala.
- A tomada removida precisa começar pela mesma palavra da refeita (senão o corte engole palavras boas).

Depois do corte: leia `decupagem_bruto.txt` (palavras removidas + motivo, trechos mantidos, texto final),
mostre ao usuário um resumo curto dos cortes e siga. Se algo bom foi cortado, ajuste `cortes.json`/parâmetros.

**Revisão manual obrigatória do "Texto final"** (o detector só pega retomadas com pausa ≥ 0,25 s):
procure falsos começos colados ("e já sabe, e sabe o mais interessante" → sai "e já sabe,").
Correção: `cortes.json` traz `words` (tempo de cada palavra) — mova o início/fim do trecho em `keep`
para o onset de energia da palavra boa (meça a energia em janelas de 20 ms; comece ~1 frame antes do
salto) e rode `python scripts/render_cut.py` (re-renderiza sem transcrever de novo).
Fluxo recomendado: `rough_cut.py --dry-run` → revisar texto → ajustar `cortes.json` → `render_cut.py`.
O resultado deve ter o ritmo do vídeo aprovado: jump cuts secos em início de frase, sem respiração longa,
sem "é…", sem repetição.

- Atualize `FRAMES` em `src/timeline.ts` com o valor impresso por `prep_video.py`.
- Revise `words.ts` (nomes próprios) e leia `transcricao.txt`.
- Olhe `broll_sheet.jpg` (tempo e frame de cada trecho) para casar trechos do vídeo adicional com a fala.
- **Reescreva as cenas** (`Scenes.tsx`, `FaceScenes.tsx`) para a fala nova. O template traz as cenas do reel
  anterior como repertório — nunca reaproveite textos, números ou tempos de outra fala.

Arquivos do template:

| Arquivo | Papel |
|---|---|
| `config.ts` | `SPEED` e `PALETTE` (respostas do questionário) |
| `timeline.ts` | beats `{id,start,end,mode,dir,light}`, `PUNCH` (zooms de face tracking), `FRAMES`, `toOut()` |
| `camera.ts` | câmera virtual: segue o rosto, zooms, transição entre modos, posições **inteiras** |
| `ui.tsx` | paletas/tokens, `Box` (abertura "barra carregando"), `Bar`, `DrawLine`, `Words`, `Header`, `Obj`, `Chip`, `Cursor`, `Ripple` |
| `Scenes.tsx` | cenas de modo `split` e `full` |
| `FaceScenes.tsx` | cenas de modo `face` (overlay inferior) e `cam` (CTA com pop-ups) |
| `MeuVideo.tsx` | composição: vídeo master contínuo, B-roll, junção, degradê, cenas, tema claro |
| `stills.mjs` | `OUT=<pasta> node stills.mjs 10 200 480` → PNGs a 40% para conferência |
| `scripts/rough_cut.py` | decupagem automática do bruto (seção 2.1) |
| `scripts/prep_video.py` / `prep_broll.py` | preparação do vídeo cortado / do vídeo adicional |
| `scripts/check_env.py`, `requirements.txt` | conferência e instalação do ambiente |

---

## 3. Quatro modos de composição (por beat, em `timeline.ts`)

| Modo | Tela | Uso |
|---|---|---|
| `split` | ilustração em cima (0–860) + rosto embaixo (860–1920) | demonstrar interface/processo enquanto fala |
| `full` | tela cheia editorial; o painel do vídeo desce e sai (voz continua) | tese, número, contraste, pergunta, frase de impacto |
| `face` | **rosto 100% na tela**; câmera sobe o rosto; base vira degradê (paleta `overlayGrad`) com animação em overlay (y ≈ 1150–1620) | hook, momentos pessoais, identidade/rosto, "qualquer pessoa" |
| `cam` | gravação 100% sem degradê; pop-ups flutuando perto do rosto | CTA de comentário |

- Ritmo típico de um reel de ~50 s: ~12–13 beats; 3–4 `full`, 2–3 `face`, 1 `cam` (CTA), resto `split`.
- Abertura sempre com o rosto (`face`), com zoom de abertura (começa colado e abre em ~22 frames).
- Nunca deixe um trecho longo (> ~6 s) sem o rosto aparecer.

---

## 4. Cor e tema

- Paletas em `ui.tsx` (`PALETTES.mono` padrão, `PALETTES.azul`). **Nunca amarelo** no padrão.
- **Alternância claro/escuro:** marque `light: true` em ~1 a cada 4 beats — de preferência telas de interface
  (chat, painel) e uma tela cheia de tese. Nunca dois beats claros seguidos; nunca o hook claro.
- O tema claro é feito por `LIGHT_FILTER` (inverte luminância preservando matiz) na cena; fotos, vídeos e objetos 3D
  recebem `className="keep"` para manter as cores reais. Fundo global interpola preto↔branco.
- Na paleta `mono`, palavras de destaque viram "marcador" (pílula clara com texto escuro) em vez de cor.

---

## 4.1 Acabamento

Tipografia, cores, superfícies, ícones, movimento e área segura seguem [design-system.md](design-system.md)
(tokens `TYPE`, `tracking()`, `SAFE`, `MATERIAL`, `Icon` em ui.tsx). No modo rosto, cartões usam `<Box material>`
e ficam entre y 1300 e 1550, à esquerda da coluna de botões do app.

## 5. Motion: rápido, fluido, sempre com entrada e saída

- **Toda caixa, card, barra, seta ou linha abre como "barra carregando"**: uma barra fina cresce da esquerda
  para a direita e se abre verticalmente na caixa; o conteúdo entra por último (`<Box>`, `<Bar>`, `<DrawLine>`).
- Tempos (30 FPS, em frames do vídeo-fonte): `Box` 9–12; palavra 8; troca de título sai em 6;
  entrada de cena 10 (translate + blur + scale), saída 7; troca de modo ~13 (curva S); objeto 3D pop 10.
- Cada cena tem drift contínuo sutil (zoom de 2,5% ao longo do beat) — nada fica congelado.
- Prepare a entrada até ~6 frames antes da palavra; o elemento precisa estar legível **na** palavra.
- Evite "tempo morto": nada de 10+ frames de tela vazia no início de um beat.
- Direções de entrada/saída alternam (`dir` do beat anterior define a entrada).
- **Face tracking** (`PUNCH` em timeline.ts): zoom de 8–16% centrado no rosto nas palavras de ênfase
  (5–8 por reel), com segurar 10–30 frames. Em `face`, colchetes de reconhecimento podem seguir o rosto real
  (`camera(f).faceScreen`).

---

## 6. Vídeo adicional (comercial / B-roll)

- Sempre **mudo**; a voz do apresentador nunca é interrompida (vídeo master contínuo).
- Entra no painel de baixo (modo `split`) no lugar do rosto, em trechos que **casam com a fala**
  (lista `BROLL` em MeuVideo.tsx: `{from,to,src,label}`; `src` = frame do comercial a 30 FPS).
- Transição: **esmaecimento** (opacidade + leve zoom + blur, 9 frames). **Nunca cortina/wipe com linha
  passando no rosto.**
- Quadro 2.35:1 fica centralizado sobre uma cópia ampliada e desfocada do próprio vídeo; etiqueta (Chip) com o que é.
- Em `full`, um trecho do comercial pode aparecer emoldurado sob o lettering (ex.: palavra de impacto + trecho do vídeo).
- Mantenha o rosto nos momentos pessoais: hook, identidade/rosto, "qualquer pessoa", CTA.

---

## 7. CTA de comentário

- **Não** usar tela cheia "Comenta a palavra X".
- Modo `cam`: vídeo 100% + zoom leve; na fala "manda/comenta a palavra", surge um campo de comentário na base,
  digita a palavra no frame em que ela é dita, envia (clique), e ela vira um balão de comentário ao lado do rosto;
  mais 2 comentários de perfis fictícios entram empilhados, com coração. Tudo acima de y ≈ 1660 (área da legenda do app).

---

## 8. Imagens com Higgsfield (quando aprovado no questionário)

- Modelo `gpt_image_2_5`, `quality: "medium"`, `background: "transparent"`.
- Para economizar: gere **folhas de 3 objetos** em `aspect_ratio: "21:9"` e recorte por colunas de alpha
  (unir segmentos com vão < 30 px). Estilo de prompt:
  > Three separate 3D icon objects in a single horizontal row, evenly spaced with wide empty gaps between them,
  > each centered in its own third of the image, same size, not touching: (1) …, (2) …, (3) …. Premium 3D render,
  > glossy glass mixed with soft matte clay, color palette strictly <cores da paleta>, soft studio lighting with
  > subtle rim light, isolated objects on a fully transparent background, no text, no ground shadow, no floor.
- Biblioteca já pronta em `public/gpt/` (paleta azul): loja, empresa, produto, aviao, ab, foguete, megafone,
  chat, lupa, guia, engrenagem, comentario, bag. Reaproveite quando servir à fala; em paleta `mono`, gere novas.
- Texto que precisa ser exato é desenhado no código, nunca dentro da imagem gerada.
- Logotipos de terceiros: só com o arquivo oficial fornecido pelo usuário e respeitando as regras da marca. Sem ele, use o
  componente `Logo` (ícone neutro) ou um wordmark tipográfico — nunca imite um logotipo.

---

## 9. Proibido (padrão MotionPly)

- Legenda corrida entre ilustração e vídeo (removida; só lettering editorial).
- Efeitos sonoros por padrão — só adicionar se o usuário pedir.
- Linha visível na junção ilustração/vídeo (posições inteiras + faixa de cobertura na cor do fundo).
- Wipe de baixo para cima com linha passando no rosto.
- Amarelo; paleta presa em um único modo (sem alternância claro/escuro).
- Ilustrações chapadas monocromáticas quando a geração de imagens foi aprovada.
- Cobrir boca/olhos com overlay ou pop-up.
- Risco inclinado sobre palavra/número negado — no P&B a negação é **vermelha**; em outras paletas, linha **horizontal** (design-system.md §3.1).

---

## 9.1 Skills complementares do usuário

O usuário pode instalar skills extras (tipografia, emojis, qualidade da escrita, estética "Apple", menos cara de IA).
Quando existirem, **carregue-as antes de escrever letterings e escolher fontes** e aplique-as por cima deste padrão
(elas mandam em tipografia, texto e emojis; este documento manda em estrutura, modos, motion, corte e entrega).

## 10. Verificação e entrega

1. `npx.cmd tsc --noEmit`.
2. Contact sheet de estados legíveis + transições (`stills.mjs`), olhar cada modo, tema claro, B-roll e CTA.
3. Varredura da junção (linha fina de 1 px) em todos os frames do render:
   ```python
   a=f.to_ndarray(format='gray').astype(int)[:,100:980].mean(1); seg=a[840:1100]
   spike=seg[1:-1]-np.maximum(seg[:-2],seg[2:])   # > 15 = linha
   ```
4. Conferir duração = FRAMES/30/SPEED, resolução 1080×1920, áudio presente.
5. Render: `npm.cmd run render` (sai em `out/`). Se SPEED ≠ 1, nomeie o arquivo com a velocidade.
6. Relatar com honestidade o que foi verificado (quadros) e que o sincronismo com áudio depende de o usuário assistir.

## 11. Armadilhas técnicas conhecidas (Windows)

- ffmpeg embutido do Remotion não tem filtros `scale/fps` → converter com PyAV (scripts já fazem).
- `backdrop-filter` (material translúcido) funciona no render do Remotion (Chrome headless).
- Chrome do Remotion não decodifica HEVC 4K do iPhone → sempre transcodificar para H.264 1080×1920.
- OpenCV 5 não tem Haar cascades → YuNet (`scripts/models/face_detection_yunet_2023mar.onnx`).
- Variáveis de ambiente não persistem entre comandos do shell; `rm` com variável é bloqueado → caminho literal.
- `stills.mjs` precisa de `OUT` definido no **mesmo** comando. Os frames de `stills.mjs` são da composição
  final: frame-fonte ÷ `SPEED` (ex.: 1.1x → `round(fr/1.1)`).
- **Disco cheio** se disfarça de outros erros: `npm ci` falha com `ENOENT ... node_modules\.bin\*.ps1`, e scripts
  gravam arquivos vazios. Antes de montar o projeto, confira o espaço
  (`Get-PSDrive -PSProvider FileSystem`) — precisa de ~2 GB livres (node_modules ~700 MB + vídeos + render);
  se faltar, crie o projeto em outro disco. Com o mesmo `package-lock.json`, dá para copiar `node_modules`
  de um projeto que já funciona (`robocopy ... /E /MT:32`) em vez de `npm ci`.
- Vídeo de celular 720p/HEVC também precisa passar pelos scripts (saem H.264 1080×1920, 30 FPS).

## 12. Tipografia do lettering (paleta mono)

- Palavras de destaque vizinhas formam **uma faixa contínua de marcador** (não uma pílula por palavra);
  o marcador abre da esquerda para a direita como barra carregando (implementado em `Words`, ui.tsx).
- Números grandes com `fontVariantNumeric: "tabular-nums"` para o contador não "tremer".
