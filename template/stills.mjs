import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";
import path from "node:path";
const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve("src/index.tsx")});
const composition = await selectComposition({serveUrl, id: process.env.COMP || "MeuVideo"});
const dir = process.env.OUT;
for (const frame of frames) {
  await renderStill({serveUrl, composition, frame, output: `${dir}/f${String(frame).padStart(4,"0")}.png`, scale: 0.4});
}
console.log("ok");
