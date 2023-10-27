export enum Path {
  FLOOR_MODEL = "assets/scene/ground/FloorBaseGrass_01.glb",
  FLOOR_TEXTURE = "assets/scene/ground/Floor_Grass01.png.png",
  PREFERENCES = "inspector-preferences.json",
  COMPOSITE = "assets/scene/main.composite",
  CRDT = "main.crdt",
  SCENE = "scene.json",
  JS = "bin/index.js",
}

export enum Hash {
  FLOOR_MODEL = "bafkreibytthve4zjlvbcnadjec2wjex2etqxuqtluriefzwwl4qe2qynne",
  FLOOR_TEXTURE = "bafkreid2fuffvxm6w2uimphn4tyxyox3eewt3r67zbrewbdonkjb7bqzx4",
}

export const SCENE_SIZE = 3;

export const IGNORED_PATHS: string[] = [Path.SCENE, Path.PREFERENCES];
export const MUTABLE_PATHS: string[] = [Path.COMPOSITE, Path.CRDT];

export function isIgnored(path: string) {
  return IGNORED_PATHS.includes(path);
}

export function isMutable(path: string) {
  return MUTABLE_PATHS.includes(path);
}
