import { createEntity } from "../../../lib/entity";
import { Env } from "../../../lib/env";
import { Path, getContentPath, getMutableHash } from "../../../lib/mappings";
import { json } from "../../../lib/response";

export const onRequestPost: PagesFunction<Env, "id"> = async (context) => {
  const tokenId = context.params.id as string;
  // reset entity
  const hash = await getMutableHash(tokenId, Path.ENTITY);
  const path = getContentPath(hash);
  const entity = await createEntity(context.env.storage, tokenId);
  await context.env.storage.put(path, JSON.stringify(entity, null, 2));
  return json(entity);
};
