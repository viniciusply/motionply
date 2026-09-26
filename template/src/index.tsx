// MotionPly · @oviniciusply
import React from "react";
import { Composition, registerRoot } from "remotion";
import { FPS, MeuVideo, OUT_FRAMES } from "./MeuVideo";
import { TipoVideo } from "./tipo/TipoVideo";
import { TelaVideo } from "./tela/TelaVideo";

// Duas modalidades de edição sobre o mesmo vídeo preparado:
//   MeuVideo  = EDIÇÃO MOTION (ilustrações, gráficos, interfaces, modos split/full/face/cam)
//   TipoVideo = TIPOGRAFIA MOTION (vídeo em tela cheia + tipografia, zoom, espelhamento, face tracking pontual)
//   TelaVideo = TIPOGRAFIA MOTION HORIZONTAL 16:9 (gravação de tela + webcam; regiões rastreadas)
const Root = () => (
  <>
    <Composition id="MeuVideo" component={MeuVideo} durationInFrames={OUT_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="TipoVideo" component={TipoVideo} durationInFrames={OUT_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="TelaVideo" component={TelaVideo} durationInFrames={OUT_FRAMES} fps={FPS} width={1920} height={1080} />
  </>
);
registerRoot(Root);
