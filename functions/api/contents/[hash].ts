import { Env } from "../../lib/env";
import { getContentPath } from "../../lib/mappings";
import { error } from "../../lib/response";

export const onRequestGet: PagesFunction<Env, "hash"> = async (context) => {
  const hash = context.params.hash;
  if (!hash || Array.isArray(hash)) {
    return error(`Invalid hash="${hash}"`, 400);
  }
  const path = getContentPath(hash);
  const obj = await context.env.storage.get(path);
  if (obj) {
    const headers =
      obj.httpMetadata && obj.httpMetadata.cacheControl
        ? { "Cache-Control": obj.httpMetadata.cacheControl }
        : {};
    return new Response(obj.body, { headers });
  } else {
    return error("Not found", 404);
  }
};
