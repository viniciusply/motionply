# Template MotionPly (Remotion) — @oviniciusply

Base de código aprovada para os reels. Siga [../references/padrao-lapidado.md](../references/padrao-lapidado.md).

## Uso rápido (PowerShell 5.1)

```powershell
Copy-Item -Recurse "<SKILL>\template" "<pasta-de-trabalho>\<projeto>"   # <SKILL> = pasta desta skill
cd "<pasta-de-trabalho>\<projeto>"
python scripts/check_env.py                                # confere o ambiente (pip install -r scripts/requirements.txt)
npm.cmd ci
python scripts/rough_cut.py "C:\...\bruto.MOV" --dry-run  # só se o vídeo for BRUTO → relatório + cortes.json
#   revisar "Texto final" (falsos começos colados) e ajustar cortes.json se preciso
python scripts/render_cut.py                               # → bruto_cortado.mp4
python scripts/prep_video.py bruto_cortado.mp4             # (ou o vídeo já cortado)
python scripts/prep_broll.py "C:\...\comercial.MP4"      # só se houver vídeo adicional
npm.cmd run dev                                            # Remotion Studio → composição MeuVideo
npm.cmd run render                                         # EDIÇÃO MOTION      → out/edicao-motion.mp4
npm.cmd run render:tipo                                    # TIPOGRAFIA MOTION  → out/tipografia-motion.mp4
```

1. `src/config.ts` — `SPEED` e `PALETTE` conforme o questionário.
2. `src/timeline.ts` — `FRAMES` (impresso pelo prep_video), beats com `mode`/`light`, `PUNCH`.
3. `src/MeuVideo.tsx` — lista `BROLL` (trechos do vídeo adicional que casam com a fala).
4. `src/Scenes.tsx` / `src/FaceScenes.tsx` — reescrever as cenas para a nova fala
   (as atuais são cenas de demonstração com textos genéricos e servem de repertório de animações).
5. Conferir com `OUT=<pasta> node stills.mjs <frames...>` antes do render.

`src/words.ts` e `src/faceTrack.ts` vêm vazios; o `prep_video.py` gera os do seu vídeo.
`public/gpt/` traz 13 objetos 3D (PNG transparente, paleta azul) reutilizáveis.

## Tipografia Motion

Composição `TipoVideo`, código em `src/tipo/`. Só é preciso escrever `src/tipo/roteiro.ts`
(beats com `cam`, `text`, `card`) — ver [../references/tipografia-motion.md](../references/tipografia-motion.md).
Prévia: `COMP=TipoVideo OUT=<pasta> node stills.mjs <frames>`.

## Horizontal 16:9 (gravação de tela + webcam)

`python scripts/track_tela.py` (depois do prep_video) → escrever `src/tela/roteiroTela.ts` →
`COMP=TelaVideo OUT=<pasta> node stills.mjs <frames>` → `npm.cmd run render:tela`.
Detalhes: tipografia-motion.md §7. Roteiro de demonstração em `src/tela/roteiroTela.ts`.
`prep_video.py` e `render_cut.py` detectam a orientação sozinhos; `--roi=x0,y0,x1,y1` restringe o rosto rastreado.
