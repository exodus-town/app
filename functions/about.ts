import { Env } from "./lib/env";

export const onRequest: PagesFunction<Env> = async () => {
  // const obj = await context.env.storage.get("logo.png");
  // return new Response(obj.body);
  return new Response("about");
};
