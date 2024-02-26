import { getAbout, getUrns } from "../lib/about";
import { Env } from "../lib/env";
import { json } from "../lib/response";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const about = getAbout();
  delete about.configurations.cityLoaderContentServer;
  about.configurations.scenesUrn = await getUrns(context.env);
  return json(about);
};
