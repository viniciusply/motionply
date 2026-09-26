---
name: motionply
description: MotionPly (por @oviniciusply) — edição de reels e vídeos narrados em Remotion com duas modalidades. EDIÇÃO MOTION (ilustrações, gráficos, interfaces e objetos 3D sincronizados à fala; ilustração em cima + rosto, tela cheia editorial, rosto 100% com overlay, CTA com pop-ups de comentário; vídeo adicional/B-roll alternando com o rosto) e TIPOGRAFIA MOTION (vídeo em tela cheia 9:16 ou gravação de tela 16:9 + tipografia editorial, zoom in/out por frase, espelhamento, face tracking só nos momentos de atenção). Decupa vídeo bruto automaticamente (começa na 1ª letra, sem silêncios, sem repetições/erros). Sempre que o usuário enviar um vídeo novo, começar pelo questionário (formato, modalidade, imagens, cor, vídeo adicional, velocidade) e partir do template incluso.
metadata:
  version: "1.0"
  author: "@oviniciusply"
---

# MotionPly — edição dinâmica de vídeos narrados

Criado por **@oviniciusply**. A pessoa fala; a edição torna a ideia visível no instante exato em que ela é dita.
Tudo o que a edição precisa está nesta pasta: documentos, template Remotion, scripts de decupagem e face tracking,
modelo de detecção de rosto e objetos 3D.

## 1. Duas modalidades (mesmo template, mesma decupagem, mesmo acabamento)

| Modalidade | O que é | Documento | Composição / render |
|---|---|---|---|
| **Edição Motion** | ilustrações, gráficos, interfaces e objetos 3D sincronizados à fala; modos `split` / `full` / `face` / `cam` | [padrao-lapidado.md](references/padrao-lapidado.md) | `MeuVideo` — `npm.cmd run render` |
| **Tipografia Motion** | vídeo em tela cheia + tipografia editorial, corte de enquadramento por frase (zoom in/out), espelhamento, socos de zoom, face tracking pontual, cartões preto/branco | [tipografia-motion.md](references/tipografia-motion.md) | `TipoVideo` (9:16) — `npm.cmd run render:tipo` · `TelaVideo` (16:9, gravação de tela + webcam) — `npm.cmd run render:tela` |

**Acabamento (as duas):** [design-system.md](references/design-system.md) — texto nunca < 30 px, tracking óptico,
contraste ≥ 4,5:1, branco suavizado, **sem glow neon**, material translúcido sobre o vídeo, ícones vetoriais (`Icon`),
**negação em vermelho no preto e branco / linha horizontal nas outras paletas (nunca risco inclinado)**, movimento só
com propósito e **área segura do Reels**. Rode o checklist da seção 8 antes de todo render.

## 2. Primeiro passo, sempre — questionário

Com a ferramenta de perguntas (ex.: AskUserQuestion), **antes de editar ou gastar créditos**:

- **Formato** (só se o vídeo for deitado / gravação de tela): horizontal 16:9 ou vertical 9:16?
- **Modalidade:** Edição Motion ou Tipografia Motion?
- **Imagens** (só Edição Motion): gerar objetos 3D com uma ferramenta de imagem conectada (ex.: Higgsfield / GPT Image — informe custo e saldo antes) ou ilustrações monocromáticas em SVG/código (sem custo)?
- **Cor do motion:** preto e branco (padrão, alternando claro/escuro), azul-escuro/azul-claro/branco, ou outra?
- **Vídeo adicional:** comercial / B-roll? Se sim, pedir o arquivo (entra mudo, alternando com o rosto).
- **Velocidade do render:** 1.2x (recomendado), 1.1x, 1.0x ou 1.25x → `CONFIG.SPEED`.
- **Gravação de tela:** quanto movimento de câmera (dinâmico por frase ou calmo: só tela inteira ↔ webcam)?

Depois da transcrição, confirme só o ambíguo: palavra do CTA e nomes próprios (o Whisper erra nomes de marcas).

## 3. Vídeo bruto → decupagem automática antes de tudo

`template/scripts/rough_cut.py` (detalhes em padrao-lapidado.md §2.1):
- o vídeo começa **já na primeira letra** da primeira palavra ("amarelo" → o 1º frame já tem o "a");
- silêncios e baixo ruído removidos; pausas ≤ 0,15 s no meio da frase e ≤ 0,30 s no fim;
- **erros**: frase repetida em momentos próximos, tomada abandonada e gagueira — fica sempre a **última** tomada;
- jump cuts secos em início de frase, alinhados a frames, com micro-fade de áudio;
- relatório `decupagem_bruto.txt`. **Revise o "Texto final"**: falsos começos colados (sem pausa) e tomadas
  abandonadas longas podem escapar — ajuste `cortes.json` e rode `render_cut.py`.

## 4. Princípios de edição (valem para as duas modalidades)

1. **A fala é o relógio.** Monte uma tabela de beats com tempos reais (words.ts): início, fim, trecho, palavra de
   disparo, modo/enquadramento, o que aparece e o que muda. A informação precisa estar legível **na** palavra.
2. **Mostre o verbo.** Se a fala compara, mostre alternativas; se fala de tempo, um relógio andando; de escala,
   multiplique; de negação, a palavra em vermelho. Um protagonista visual por beat.
3. **Lettering sintetiza, não transcreve.** Poucas palavras, a palavra-chave marcada; sem legenda corrida
   (salvo pedido). Nunca invente números ou nomes que não foram ditos.
4. **Rosto é atenção.** Gancho, momentos pessoais, viradas e CTA pedem o rosto; nunca fique > ~6 s sem ele.
5. **Movimento com propósito.** Cada entrada, zoom ou corte comunica algo; nada de animação decorativa em loop.
6. **Preserve o que foi aprovado.** Correções do usuário prevalecem; ajuste pontualmente sem refazer tudo.
7. **Verificação honesta.** Tipos (`tsc`), stills dos estados legíveis e das transições, varredura da junção,
   duração/resolução/áudio do render. Diga o que foi verificado; sincronismo fino depende de assistir com som.

## 5. Portabilidade e ambiente

Copie `template/` para a pasta de trabalho e siga [template/LEIA-ME.md](template/LEIA-ME.md).
`python scripts/check_env.py` confere Python, pacotes, modelo de rosto e Node; `pip install -r scripts/requirements.txt`
instala o que faltar. Na 1ª transcrição o faster-whisper baixa ~1,5 GB. Confira espaço em disco (~2 GB) antes.
Windows/PowerShell: sem `&&` (use `;`), `npm.cmd`/`npx.cmd` se a política bloquear scripts.

## 6. Skills complementares

Skills de tipografia, escrita, emojis ou estética instaladas pelo usuário mandam no **texto e nas fontes**;
o MotionPly manda em estrutura, modos, câmera, corte, acabamento e entrega.

---
MotionPly · @oviniciusply
