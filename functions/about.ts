import { getAbout, getTownBounds } from "./lib/about";
import { Env } from "./lib/env";
import { json } from "./lib/response";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const about = getAbout(new URL(request.url).origin);
  about.configurations.map = {
    minimapEnabled: false,
    sizes: [await getTownBounds(env)],
  };
  return json(about);
};
