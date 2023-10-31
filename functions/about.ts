import { getAbout } from "./lib/about";
import { Env } from "./lib/env";
import { json } from "./lib/response";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const about = await getAbout(context.env);
  return json(about);
};
