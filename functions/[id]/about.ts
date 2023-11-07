import { getAbout } from "../lib/about";
import { Env } from "../lib/env";
import { error, json } from "../lib/response";

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const tokenId = context.params.id;
  if (!tokenId || Array.isArray(tokenId) || isNaN(Number(tokenId))) {
    return error(`Invalid tokenId=${tokenId}`, 400);
  }
  const about = await getAbout(context.env, tokenId);
  return json(about);
};
