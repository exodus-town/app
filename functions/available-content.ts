import { Env } from "./lib/env";
import { getContentPath } from "./lib/mappings";
import { json } from "./lib/response";

type Result = {
  cid: string;
  available: boolean;
};

export const onRequestGet: PagesFunction<Env, "cid"> = async (context) => {
  const url = new URL(context.request.url);
  const cids = url.searchParams.getAll("cid");

  const promises: Promise<Result>[] = [];
  for (const cid of cids) {
    const path = getContentPath(cid);
    const promise: Promise<Result> = context.env.storage
      .head(path)
      .then((result) => ({
        cid,
        available: !!result,
      }));
    promises.push(promise);
  }

  const results = await Promise.all(promises);

  return json(results);
};
