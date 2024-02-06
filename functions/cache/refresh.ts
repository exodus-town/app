import { getAbout } from "../lib/about";
import { Env } from "../lib/env";
import { json } from "../lib/response";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const about = await getAbout(context.env);
  await context.env.storage.put("about.json", JSON.stringify(about, null, 2));
  return json(about);
};
