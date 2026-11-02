import fs from "fs";
import path from "path";

// Copy inspector assets to the public folder
const inspectorPath = path.resolve("./node_modules/@dcl/inspector");
const inspectorAssetsPath = path.resolve(inspectorPath, "./public");
const inspectorPackagePath = path.resolve(inspectorPath, "./package.json");

console.log("Inspector assets:", inspectorAssetsPath);
const files = fs.readdirSync(inspectorAssetsPath);
const publicPath = path.resolve("./public");
console.log("Public folder:", publicPath);
console.log(
  "Inspector version:",
  JSON.parse(fs.readFileSync(inspectorPackagePath, "utf-8")).version
);
for (const file of files) {
  const source = path.resolve(inspectorAssetsPath, file);
  if (file.endsWith(".map")) continue;
  // The optional Bevy renderer ships a >100 MB wasm (over the Pages file limit); the inspector
  // uses its Babylon renderer unless told otherwise.
  if (file === "bevy-engine" || file === "bevy-agent") continue;
  const filename = file === "index.html" ? "inspector.html" : file;
  const target = path.resolve(publicPath, filename);
  console.log(`> Copying ${file} as ${filename}...`);
  fs.cpSync(source, target, { recursive: true });
}

// Copy the Decentraland web explorer (bevy-explorer) to public/play. The page, the engine glue,
// its workers, the bridge scene and the service worker must be served from this origin; the build
// fetches its other assets, including the >100 MB engine wasm, from the versioned Decentraland CDN
// baked into it, so the wasm is not copied.
const explorerPath = path.resolve("./node_modules/@dcl-regenesislabs/bevy-explorer-web");
const explorerVersion = JSON.parse(
  fs.readFileSync(path.resolve(explorerPath, "./package.json"), "utf-8")
).version;
const playPath = path.resolve(publicPath, "./play");
const skip = new Set([
  "package.json",
  "scripts",
  "serve.json",
  "PREVIEW_REALM.md",
  path.join("engine", "pkg", "webgpu_build_bg.wasm"),
]);
console.log("Explorer version:", explorerVersion);
fs.rmSync(playPath, { recursive: true, force: true });
fs.cpSync(explorerPath, playPath, {
  recursive: true,
  filter: (source) => !skip.has(path.relative(explorerPath, source)),
});
console.log(`> Copied the explorer to ${playPath}`);
