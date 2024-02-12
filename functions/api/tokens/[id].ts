import { Buffer } from "node:buffer";
import { toCoords } from "../../lib/coords";
import { Env } from "../../lib/env";
import { json } from "../../lib/response";
import { getContentPath, getHash, isMutable } from "../../lib/mappings";
import { addContent, removeContent } from "../../lib/entity";

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const tokenId = context.params.id as string;
  const [x, y] = toCoords(tokenId);
  const name = `${x},${y}`;
  const result = {
    id: context.params.id,
    name,
    description: `Parcel ${name} at Exodus Town`,
    image: `https://exodus.town/api/tokens/${tokenId}/image`,
    external_url: `https://decentraland.org/play?realm=exodus.town/${tokenId}`,
    attributes: [
      { trait_type: "X", value: x, display_type: "number" },
      { trait_type: "Y", value: y, display_type: "number" },
    ],
    background_color: "ffffff",
  };
  return json(result);
};

export const onRequestPost: PagesFunction<Env, "id"> = async (context) => {
  const tokenId = context.params.id as string;
  const data = await context.request.formData();

  // save file
  const mappings = new Map<string, string>();
  for (const [path, content] of data) {
    const file = content as unknown as File;
    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = await getHash(path, buffer, tokenId);
    mappings.set(path, hash);
    let httpMetadata: Headers | undefined;
    if (!isMutable(path)) {
      httpMetadata = new Headers({
        "Cache-Control": "max-age=31536000, s-maxage=31536000, immutable",
      });
      const exists = await context.env.storage.head(getContentPath(hash));
      if (exists) {
        continue;
      }
    }
    await context.env.storage.put(getContentPath(hash), buffer, {
      httpMetadata,
    });
  }

  // add to entity
  const entity = await addContent(context.env, tokenId, mappings);

  return json(entity);
};

export const onRequestDelete: PagesFunction<Env, "id"> = async (context) => {
  const tokenId = context.params.id as string;
  const data = await context.request.formData();

  // gather paths to remove
  const paths = new Set<string>();
  for (const [path] of data) {
    if (isMutable(path)) {
      continue;
    }
    paths.add(path);
  }

  // remove from entity
  const entity = await removeContent(context.env, tokenId, paths);

  return json(entity);
};
