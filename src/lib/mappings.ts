export enum Path {
  FLOOR_MODEL = "assets/scene/ground/FloorBaseGrass_01.glb",
  FLOOR_TEXTURE = "assets/scene/ground/Floor_Grass01.png.png",
  PREFERENCES = "inspector-preferences.json",
  COMPOSITE = "assets/scene/main.composite",
  CRDT = "main.crdt",
  SCENE = "scene.json",
  JS = "bin/index.js",
  NAVMAP_THUMBNAIL = "navmapThumbnail.png",
}

export enum Hash {
  FLOOR_MODEL = "bafkreibytthve4zjlvbcnadjec2wjex2etqxuqtluriefzwwl4qe2qynne",
  FLOOR_TEXTURE = "bafkreid2fuffvxm6w2uimphn4tyxyox3eewt3r67zbrewbdonkjb7bqzx4",
}

export const MUTABLE_PATHS: string[] = [
  Path.PREFERENCES,
  Path.SCENE,
  Path.COMPOSITE,
  Path.CRDT,
  Path.NAVMAP_THUMBNAIL,
];

export function isMutable(path: string) {
  return MUTABLE_PATHS.includes(path);
}
