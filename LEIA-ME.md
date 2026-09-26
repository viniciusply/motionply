# MotionPly — por @oviniciusply

Skill de edição de reels e vídeos narrados com IA, em duas modalidades:

- **Edição Motion** — ilustrações, gráficos, interfaces e objetos 3D sincronizados à sua fala.
- **Tipografia Motion** — seu vídeo em tela cheia com tipografia editorial, zooms por frase, espelhamento e
  face tracking nos momentos de atenção. Funciona em vertical (9:16) e em gravação de tela horizontal (16:9).

Inclui decupagem automática do vídeo bruto (começa na primeira letra, tira silêncios, erros e repetições).

## Instalação

1. Coloque a pasta `motionply` no diretório de skills do seu agente de IA (ex.: `.claude/skills/`).
   O `SKILL.md` deve ficar na raiz da pasta.
2. Instale **Node.js LTS** e **Python 3.10+**.
3. Numa cópia de `template/`, rode `python scripts/check_env.py` e, se faltar algo,
   `pip install -r scripts/requirements.txt` e `npm ci`.

## Uso

Envie seu vídeo e diga: *"Use a skill MotionPly para editar este vídeo."*
A IA faz um questionário curto (formato, modalidade, cor, velocidade…), decupa o bruto, monta a edição,
mostra prévias e renderiza.

## Conteúdo

| Pasta | O quê |
|---|---|
| `SKILL.md` | instruções principais |
| `references/` | padrão da Edição Motion, Tipografia Motion e sistema de design |
| `template/` | projeto Remotion pronto (código, scripts, modelo de face tracking, objetos 3D) e exemplos |

## Direitos e dependências

- MotionPly © @oviniciusply. Uso conforme os termos de compra.
- Dependências de terceiros mantêm suas licenças: Remotion (verifique a licença para uso comercial/empresas),
  faster-whisper, OpenCV (modelo YuNet), fontes Inter e Instrument Serif (Google Fonts, licença OFL).
- Marcas citadas nos exemplos pertencem aos seus donos; os exemplos mostram conteúdo do próprio autor.
  Use suas próprias mídias e identidade; só use logotipos de terceiros com o arquivo oficial e dentro das regras da marca.
- Geração de imagens por IA (opcional) usa sua própria conta na ferramenta escolhida.
