export enum Path {
  FLOOR_MODEL = "assets/scene/ground/FloorBaseGrass_01.glb",
  FLOOR_TEXTURE = "assets/scene/ground/Floor_Grass01.png.png",
  PREFERENCES = "inspector-preferences.json",
  COMPOSITE = "assets/scene/main.composite",
  CRDT = "main.crdt",
  SCENE = "scene.json",
  JS = "bin/index.js",
  ENTITY = "entity.json",
}

export function getContentPath(hash: string) {
  return `/api/contents/${hash}`;
}
