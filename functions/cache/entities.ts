import { getEntityMappings } from "../lib/entity";
import { Env } from "../lib/env";
import { json } from "../lib/response";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const entites = await getEntityMappings(context.env);
  return json(entites);
};
