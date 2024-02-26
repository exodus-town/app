import { getAbout, getUrns } from "../lib/about";
import { Env } from "../lib/env";
import { error, json } from "../lib/response";

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const tokenId = context.params.id;
  if (!tokenId || Array.isArray(tokenId) || isNaN(Number(tokenId))) {
    return error(`Invalid tokenId=${tokenId}`, 400);
  }
  const about = getAbout();
  delete about.configurations.cityLoaderContentServer;
  about.configurations.scenesUrn = await getUrns(context.env, tokenId);
  return json(about);
};
