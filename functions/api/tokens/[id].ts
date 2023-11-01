import { Buffer } from "node:buffer";
import { toCoords } from "../../lib/coords";
import { Env } from "../../lib/env";
import { json } from "../../lib/response";
import { getContentPath, getHash, isMutable } from "../../lib/mappings";
import { addContent } from "../../lib/entity";

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const tokenId = context.params.id as string;
  const [x, y] = toCoords(tokenId);
  const name = `${x},${y}`;
  const result = {
    id: context.params.id,
    name,
    description: `Parcel ${name} at Exodus Town`,
    external_url: `https://play.decentraland.org?realm=exodus.town/${tokenId}`,
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
  const mappings = new Map();
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
  const entity = await addContent(context.env.storage, tokenId, mappings);

  return json(entity);
};
