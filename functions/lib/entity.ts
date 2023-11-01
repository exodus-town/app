import { Buffer } from "node:buffer";
import { createComposite } from "./composite";
import { CRDT, FLOOR_MODEL, FLOOR_TEXTURE } from "./files";
import { hashV1 } from "./hash";
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

async function upload(storage: R2Bucket, file: string, buffer: Buffer) {
  const hash = await hashV1(buffer);
  const path = getContentPath(hash);
  const exists = await storage.head(path);
  if (!exists) {
    await storage.put(path, buffer, {
      httpMetadata: new Headers({
        "Cache-Control": "max-age=31536000, s-maxage=31536000, immutable",
      }),
    });
  }
  return { file, hash };
}

async function uploadJSON(storage: R2Bucket, file: string, content: unknown) {
  const json = JSON.stringify(content, null, 2);
  const buffer = Buffer.from(json, "utf-8");
  return upload(storage, file, buffer);
}

export async function createEntity(
  storage: R2Bucket,
  tokenId: string
): Promise<Entity> {
  const entityHash = await getMutableHash(tokenId, Path.ENTITY);
  const scene = createScene(tokenId);
  const composite = createComposite(tokenId);
  return {
    id: entityHash,
    type: "scene",
    pointers: scene.scene.parcels,
    timestamp: Date.now(),
    content: await Promise.all([
      upload(storage, Path.FLOOR_MODEL, FLOOR_MODEL),
      upload(storage, Path.FLOOR_TEXTURE, FLOOR_TEXTURE),
      uploadJSON(storage, Path.SCENE, scene),
      uploadJSON(storage, Path.COMPOSITE, composite),
      upload(storage, Path.CRDT, CRDT),
    ]),
    metadata: scene,
  };
}

export async function getEntity(storage: R2Bucket, tokenId: string) {
  const hash = await getMutableHash(tokenId, Path.ENTITY);
  const path = getContentPath(hash);
  const exists = await storage.head(path);
  if (!exists) {
    const entity = await createEntity(storage, tokenId);
    await storage.put(path, JSON.stringify(entity, null, 2));
  }
  const obj = await storage.get(path);
  return obj.json<Entity>();
}

export async function addContent(
  storage: R2Bucket,
  tokenId: string,
  mappings: Map<string, string>
): Promise<Entity> {
  const entity = await getEntity(storage, tokenId);
  let hasChanges = false;
  if (mappings.size > 0) {
    for (const [path, hash] of mappings) {
      if (
        !entity.content.some((content) => content.file === path) ||
        entity.content.some(
          (content) => content.file === path && content.hash !== hash
        )
      ) {
        hasChanges = true;
        entity.content = [
          ...entity.content.filter((content) => content.file !== path),
          {
            file: path,
            hash,
          },
        ];
      }
    }

    if (hasChanges) {
      await storage.put(
        getContentPath(entity.id),
        JSON.stringify(entity, null, 2)
      );
    }
  }
  return entity;
}
