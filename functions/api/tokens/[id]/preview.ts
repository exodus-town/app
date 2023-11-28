import { Env } from "../../../lib/env";
import { EMPTY_THUMBNAIL } from "../../../lib/files";
import { Path, getContentPath, getMutableHash } from "../../../lib/mappings";
import { error } from "../../../lib/response";

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const tokenId = context.params.id as string;
  if (isNaN(+tokenId) || +tokenId < 0)
    return error(`Invalid tokenId=${tokenId}`, 400);
  const hash = await getMutableHash(tokenId, Path.THUMBNAIL);
  const path = getContentPath(hash);
  const exists = await context.env.storage.head(path);
  if (!exists) {
    return new Response(EMPTY_THUMBNAIL, {
      headers: { "Content-Type": "image/png" },
    });
  }
  const obj = await context.env.storage.get(path);
  return new Response(obj.body);
};
