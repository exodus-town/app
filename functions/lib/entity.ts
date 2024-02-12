import { Buffer } from "node:buffer";
import { createComposite } from "./composite";
import { CRDT, FLOOR_MODEL, FLOOR_TEXTURE } from "./files";
import { hashV1 } from "./hash";
import { Path, getContentPath, getMutableHash } from "./mappings";
import { createScene } from "./scene";
import { getAuctionHouse } from "./contracts";
import { Env } from "./env";
import { reduceCoords } from "./coords";

export type Entity = {
  id: string;
  type: string;
  pointers: string[];
  timestamp: number;
  content: { hash: string; file: string }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
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
    console.log(`Generating entity for tokenId=${tokenId}`);
    const entity = await createEntity(storage, tokenId);
    await storage.put(path, JSON.stringify(entity, null, 2));
  }
  const obj = await storage.get(path);
  return obj.json<Entity>();
}

export async function addContent(
  env: Env,
  tokenId: string,
  mappings: Map<string, string>
): Promise<Entity> {
  const entity = await getEntity(env.storage, tokenId);
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
      await saveEntity(env, tokenId, entity);
    }
  }
  return entity;
}

export async function removeContent(
  env: Env,
  tokenId: string,
  paths: Set<string>
): Promise<Entity> {
  const entity = await getEntity(env.storage, tokenId);
  let hasChanges = false;
  if (paths.size > 0) {
    for (const path of paths) {
      if (entity.content.some((content) => content.file === path)) {
        hasChanges = true;
        entity.content = entity.content.filter(
          (content) => content.file !== path
        );
      }
    }

    if (hasChanges) {
      await saveEntity(env, tokenId, entity);
    }
  }
  return entity;
}

export async function getEntityMappings(
  env: Env
): Promise<
  Record<string, { hash: string; x: number; y: number; tokenId: string }>
> {
  // get max token id from auction house
  const auctionHouse = getAuctionHouse(env);
  const [maxTokenId] = await auctionHouse.read.auction();

  // load cached entities
  let entities: Record<
    string,
    { hash: string; x: number; y: number; tokenId }
  > = {};
  try {
    const obj = await env.storage.get("entities.json");
    entities = await obj.json<
      Record<string, { hash: string; x: number; y: number; tokenId: string }>
    >();
  } catch (error) {
    console.log("entities.json does not exist yet");
  }

  // generate missing entities
  const promises = reduceCoords<
    Promise<{
      hash: string;
      x: number;
      y: number;
      tokenId: string;
    }>[]
  >(
    Number(maxTokenId),
    (acc, { x, y, step }) => {
      const exists = step.toString() in entities;
      if (!exists) {
        acc.push(
          getEntity(env.storage, step.toString()).then((entity) => {
            return { hash: entity.id, x, y, tokenId: step.toString() };
          })
        );
      }
      return acc;
    },
    []
  );

  // insert missing entities
  const missing = await Promise.all(promises);
  for (const entity of missing) {
    entities[entity.tokenId] = entity;
  }

  // save entities to cache if new entities were added
  if (missing.length > 0) {
    await env.storage.put("entities.json", JSON.stringify(entities, null, 2));
  }

  // return entities
  return entities;
}

export async function saveEntity(env: Env, tokenId: string, entity: Entity) {
  // update mappings
  const mappings = await getEntityMappings(env);
  const prev = mappings[tokenId];
  mappings[tokenId] = {
    ...prev,
    hash: entity.id,
  };
  env.storage.put("entities.json", JSON.stringify(mappings, null, 2));

  // update entity
  await env.storage.put(
    getContentPath(entity.id),
    JSON.stringify(entity, null, 2)
  );
}
