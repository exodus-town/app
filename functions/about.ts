import { getAbout } from "./lib/about";
import { Env } from "./lib/env";
import { json } from "./lib/response";

export const onRequestGet: PagesFunction<Env> = async () => {
  const about = await getAbout();
  return json(about);
};
