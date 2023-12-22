import { Buffer } from "node:buffer";
import { AuthChain, ContentMapping, Scene } from "@dcl/schemas";
import { Authenticator } from "@dcl/crypto";
import { Env } from "./lib/env";
import { error, json } from "./lib/response";
import { getContentPath } from "./lib/mappings";
import { getTokenIdsFromPointers, toCoords, toId } from "./lib/coords";
import { getTownToken } from "./lib/contracts";
import { toLayout } from "./lib/layout";
import { hashV1 } from "./lib/hash";
import { Entity, getEntity } from "./lib/entity";

export function extractAuthChain(formData: FormData): AuthChain {
  const ret: AuthChain = [];

  let biggestIndex = -1;

  const fields = {};

  // find the biggest index
  for (const [key, value] of formData) {
    fields[key] = value;
    const regexResult = /authChain\[(\d+)]/.exec(key);
    if (regexResult) {
      biggestIndex = Math.max(biggestIndex, +regexResult[1]);
    }
  }

  if (biggestIndex === -1) throw new Error("Missing auth chain");
  // fill all the authChain
  for (let i = 0; i <= biggestIndex; i++) {
    ret.push({
      payload: fields[`authChain[${i}][payload]`],
      signature: fields[`authChain[${i}][signature]`],
      type: fields[`authChain[${i}][type]`],
    });
  }

  return ret;
}

export const validateFiles = async (
  entityId: string,
  entity: Entity,
  files: Record<string, File>,
  env: Env
) => {
  const errors: string[] = [];

  console.log(entity);

  // validate all files are part of the entity
  for (const key in files) {
    // detect extra file
    if (!entity.content!.some(($) => $.hash === key) && key !== entityId) {
      errors.push(`Extra file detected ${key}`);
    }
  }

  // then ensure that all missing files are uploaded
  for (const file of entity.content) {
    const isFilePresent =
      file.hash in files ||
      !!(await env.storage.head(getContentPath(file.hash)));
    if (!isFilePresent) {
      errors.push(
        `The file ${file.hash} (${file.file}) is neither present in the storage or in the provided entity`
      );
    }
  }

  return errors;
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const formData = await request.formData();

  const files: Record<string, File> = {};
  for (const [key, value] of formData) {
    const maybeFile = value as unknown;
    if (maybeFile instanceof File) {
      files[key] = maybeFile;
    }
  }

  // validate auth chain
  const entityId = formData.get("entityId");
  const authChain = extractAuthChain(formData);
  const { ok, message } = await Authenticator.validateSignature(
    entityId,
    authChain,
    null
  );
  if (!ok) {
    return error(message, 401);
  }

  // validate files
  console.log("entityId", entityId);
  console.log("files", files);
  const buffer = Buffer.from(await files[entityId].arrayBuffer());
  const text = new TextDecoder().decode(buffer);
  const entity: Entity = JSON.parse(text);
  const scene = entity.metadata as Scene;
  console.log("scene", scene.scene.parcels);

  const fileErrors = await validateFiles(entityId, entity, files, env);
  if (fileErrors.length > 0) {
    return error(fileErrors.join("\n"), 400);
  }

  // validate base and parcels
  const { base, parcels } = scene.scene;
  if (!parcels.includes(base)) {
    return error(
      `Invalid base "${base}" is not included in parcels: ${parcels.join(" ")}`,
      400
    );
  }

  // recover token id from parcels
  const town = getTownToken(context.env);
  const totalSupply = await town.read.totalSupply();
  const tokenIds = getTokenIdsFromPointers(`${totalSupply}`, parcels);

  if (tokenIds.length === 0) {
    return error(
      `Could not map the scene.json parcels to a valid Exodus Town token`,
      400
    );
  }

  if (tokenIds.length > 1) {
    return error(
      `You are trying to deploy to multiple Exodus Town parcels: ${tokenIds
        .map((tokenId) => `"${toCoords(tokenId).join(",")}"`)
        .join(", ")}`,
      400
    );
  }
  console.log("tokenIds", tokenIds);
  const tokenId = tokenIds[0]!;
  console.log("tokenId", tokenId);

  // check ownership
  const address = authChain[0].payload.toLowerCase();
  console.log("address", address);
  const owner = (await town.read.ownerOf([BigInt(tokenId)])).toLowerCase();

  if (owner !== address) {
    return error(
      `The owner of the Exodus Town parcel "${toCoords(
        tokenId
      )}" is "${owner}" and the address of the deployer is "${address}"`,
      401
    );
  }

  // validate layout
  const layout = toLayout(tokenId);
  const expectedBase = toId(layout.base.x, layout.base.y);
  if (base !== toId(layout.base.x, layout.base.y)) {
    return error(
      `The expected base for the Exodus Town parcel "${toCoords(
        tokenId
      )}" should be "${expectedBase}" and it is "${base}"`,
      400
    );
  }
  const missingParcels: string[] = [];
  for (const parcel of layout.parcels) {
    const expectedParcel = toId(parcel.x, parcel.y);
    if (!parcels.includes(expectedParcel)) {
      missingParcels.push(expectedParcel);
    }
  }
  if (missingParcels.length > 0) {
    return error(
      `There are missing parcels in the scene.json: ${missingParcels
        .map((parcel) => `"${parcel}"`)
        .join(", ")}`,
      400
    );
  }

  // upload

  // save file
  const newContent: ContentMapping[] = [];
  for (const key in files) {
    const file = files[key];
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = await hashV1(buffer);
    if (key !== entityId) {
      const path = getContentPath(hash);
      const exists = await env.storage.head(path);
      if (!exists) {
        console.log(`Storing "${hash}" ${arrayBuffer.byteLength} bytes`);
        await env.storage.put(path, file);
      } else {
        console.log(`Skipping "${hash}" it already exists`);
      }
      const content = entity.content.find((content) => content.hash === key);
      if (!content) {
        return error(
          `Could not find file with hash "${key}" in entity content`,
          500
        );
      }
      newContent.push({
        file: content.file,
        hash,
      });
    } else {
      console.log(`Skipping "${key}" it is entity`);
    }
  }

  const currentEntity = await getEntity(env.storage, tokenId);
  const newEntity: Entity = {
    ...currentEntity,
    content: newContent,
    metadata: {
      ...currentEntity.metadata,
      cli: true,
    },
  };

  console.log("newEntity", newEntity);
  console.log("newEntity.content", JSON.stringify(newEntity.content, null, 2));

  console.log(`Saving entity...`);
  await env.storage.put(
    getContentPath(newEntity.id),
    JSON.stringify(newEntity, null, 2)
  );
  console.log(`done!`);

  return json({
    message: `Your scene was successfully deployed to Exodus Town in parcel "${toCoords(
      tokenId
    ).join(",")}"`,
  });
};
