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
  const filename = file === "index.html" ? "inspector.html" : file;
  const target = path.resolve(publicPath, filename);
  console.log(`> Copying ${file} as ${filename}...`);
  fs.cpSync(source, target, { recursive: true });
}
