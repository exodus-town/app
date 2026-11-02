import { Env } from "../../lib/env";
import { Entity, withRuntime } from "../../lib/entity";
import { getContentPath } from "../../lib/mappings";
import { error, json } from "../../lib/response";

// Entity definitions are mutable files, stored without the immutable Cache-Control of content
// files and well under this size.
const MAX_ENTITY_SIZE = 256 * 1024;

export const onRequestGet: PagesFunction<Env & { ASSETS: Fetcher }, "hash"> = async (
  context
) => {
  const hash = context.params.hash;
  if (!hash || Array.isArray(hash)) {
    return error(`Invalid hash="${hash}"`, 400);
  }
  const path = getContentPath(hash);
  const obj = await context.env.storage.get(path);
  if (!obj) {
    return error("Not found", 404);
  }
  const cacheControl = obj.httpMetadata?.cacheControl;
  if (!cacheControl && obj.size <= MAX_ENTITY_SIZE) {
    // The explorer reads a scene's definition from here, not from /entities/active, so give it
    // the same scene runtime (see withRuntime).
    const text = await obj.text();
    const entity = parseEntity(text);
    if (entity) {
      const origin = new URL(context.request.url).origin;
      return json(await withRuntime(context.env, origin, entity));
    }
    return new Response(text);
  }
  const headers: HeadersInit = cacheControl ? { "Cache-Control": cacheControl } : {};
  return new Response(obj.body, { headers });
};

function parseEntity(text: string): Entity | null {
  try {
    const value = JSON.parse(text);
    return value?.type === "scene" && Array.isArray(value.content) ? value : null;
  } catch {
    return null;
  }
}
