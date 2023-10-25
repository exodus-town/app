import fs from "fs";
import path from "path";

// Copy inspector assets to the public folder
const inspectorAssetsPath = path.resolve(
  "./node_modules/@dcl/inspector/public"
);

console.log("Inspector assets:", inspectorAssetsPath);
const files = fs.readdirSync(inspectorAssetsPath);
const publicPath = path.resolve("./public");
console.log("Public folder:", publicPath);
for (const file of files) {
  const source = path.resolve(inspectorAssetsPath, file);
  const filename = file === "index.html" ? "inspector.html" : file;
  const target = path.resolve(publicPath, filename);
  console.log(`> Copying ${file} as ${filename}...`);
  fs.cpSync(source, target, { recursive: true });
}
