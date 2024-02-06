import { About } from "../lib/about";
import { Env } from "../lib/env";
import { error, json } from "../lib/response";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const exists = await context.env.storage.get("about.json");
  if (!exists) {
    return error("Static realm descriptor not found", 404);
  }
  const obj = await context.env.storage.get("about.json");
  const about = await obj.json<About>();
  return json(about);
};
