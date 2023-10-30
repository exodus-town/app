import { Path, getContentPath, getMutableHash } from "./mappings";
import { createScene } from "./scene";

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
    content: [],
    metadata: scene,
  };
}

export async function getEntity(storage: R2Bucket, tokenId: string) {
  const hash = await getMutableHash(tokenId, Path.ENTITY);
  const path = getContentPath(hash);
  const obj = await storage.get(path);
  const entity = obj ? await obj.json<Entity>() : await createEntity(tokenId);
  return entity;
}

export async function addContent(
  storage: R2Bucket,
  tokenId: string,
  mappings: Map<string, string>
): Promise<Entity> {
  const entity = await getEntity(storage, tokenId);
  if (mappings.size > 0) {
    for (const [path, hash] of mappings) {
      entity.content = [
        ...entity.content.filter((content) => content.file !== path),
        {
          file: path,
          hash,
        },
      ];
    }
    await storage.put(
      getContentPath(entity.id),
      JSON.stringify(entity, null, 2)
    );
  }
  return entity;
}
