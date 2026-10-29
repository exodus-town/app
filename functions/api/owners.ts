import { Env } from "../lib/env";
import { getOwners } from "../lib/owners";
import { json } from "../lib/response";

const MAX_AGE = 60;

// Every plot's snapshot owner and whether it was returned (see lib/owners.ts), cached at the
// edge for a minute.
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const cache = caches.default;
  const key = new Request(new URL("/api/owners", context.request.url).toString());
  const cached = await cache.match(key);
  if (cached) return cached;
  const owners = await getOwners(context.env);
  const response = json({ owners });
  response.headers.set("Cache-Control", `public, max-age=${MAX_AGE}`);
  context.waitUntil(cache.put(key, response.clone()));
  return response;
};
