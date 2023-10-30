import { Hash, Path, getContentPath, getMutableHash } from "../lib/mappings";
import { createScene } from "../lib/scene";

export type Entity = {
  id: string;
  type: string;
  pointers: string[];
  timestamp: number;
  content: { hash: string; file: string }[];
  metadata?: unknown;
};

export async function createEntity(tokenId: string): Promise<Entity> {
  const entityHash = await getMutableHash(tokenId, Path.ENTITY);
  const scene = createScene(tokenId);
  return {
    id: entityHash,
    type: "scene",
    pointers: scene.scene.parcels,
    timestamp: Date.now(),
    content: [
      {
        file: Path.FLOOR_MODEL,
        hash: Hash.FLOOR_MODEL,
      },
      {
        file: Path.FLOOR_TEXTURE,
        hash: Hash.FLOOR_TEXTURE,
      },
    ],
    metadata: scene,
  };
}

export async function getEntity(tokenId: string) {
  const hash = await getMutableHash(tokenId, Path.ENTITY);
  const path = getContentPath(hash);
  const resp = await fetch(path);
  const entity: Entity = resp.ok
    ? await resp.json()
    : await createEntity(tokenId);
  return entity;
}
