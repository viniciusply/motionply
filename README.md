# MotionPly — por @oviniciusply

Skill de edição de reels e vídeos narrados com IA (Claude Code + Remotion), em duas modalidades:
**Edição Motion** (ilustrações, gráficos e interfaces sincronizados à fala) e **Tipografia Motion**
(tipografia editorial, zooms por frase, espelhamento e face tracking — vertical 9:16 e gravação de tela 16:9).
Inclui decupagem automática do vídeo bruto.

> Repositório **privado**, exclusivo para alunos do treinamento. Acesso por convite.

## 1. Primeiro acesso

1. Crie uma conta no GitHub (se ainda não tiver) e envie seu **usuário do GitHub** para o suporte do treinamento.
2. Aceite o convite que chega no seu e-mail (ou em github.com/notifications).
3. No computador, conecte o GitHub uma vez (o Claude Code pode fazer isso com você):
   ```bash
   gh auth login
   ```

## 2. Instalar a skill

**Pelo Claude Code** — cole esta mensagem:

> Instale a skill do repositório https://github.com/viniciusply/motionply clonando-o em `~/.claude/skills/motionply` e confira se o `SKILL.md` ficou na raiz da pasta.

**Ou pelo terminal:**
```bash
git clone https://github.com/viniciusply/motionply.git ~/.claude/skills/motionply
```
(Windows/PowerShell: `git clone https://github.com/viniciusply/motionply.git "$HOME\.claude\skills\motionply"`)

Depois, instale os requisitos (Node.js LTS e Python 3.10+) — veja [LEIA-ME.md](LEIA-ME.md).

## 3. Usar

Envie seu vídeo ao Claude Code e diga: *"Use a skill MotionPly para editar este vídeo."*

## 4. Atualizar para a versão mais nova

Peça ao Claude Code *"atualize a skill MotionPly"* ou rode:
```bash
git -C ~/.claude/skills/motionply pull
```

## Licença

Uso pessoal e intransferível do aluno — veja [LICENSE](LICENSE). Proibido redistribuir, revender ou compartilhar.
