import { getAbout, getUrns } from "../lib/about";
import { Env } from "../lib/env";
import { json } from "../lib/response";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const origin = new URL(context.request.url).origin;
  const about = getAbout(origin);
  delete about.configurations.cityLoaderContentServer;
  about.configurations.scenesUrn = await getUrns(context.env, origin);
  return json(about);
};
