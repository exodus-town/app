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
    return new Response(obj.body);
  } else {
    return error("Not found", 404);
  }
};
