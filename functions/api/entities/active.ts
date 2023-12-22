import { getTownToken } from "../../lib/contracts";
import { getTokenIdsFromPointers } from "../../lib/coords";
import { getEntity } from "../../lib/entity";
import { Env } from "../../lib/env";
import { error, json } from "../../lib/response";

export const onRequestPost: PagesFunction<Env, "id"> = async (context) => {
  const { pointers } = await context.request.json<{ pointers: string[] }>();
  if (!Array.isArray(pointers)) {
    return error(`Invalid pointers=${pointers}`, 400);
  }
  if (pointers.some((pointer) => !/(-?)\d+,(-?)\d+/.test(pointer))) {
    const invalid = pointers.find(
      (pointer) => !/(-?)\d+,(-?)\d+/.test(pointer)
    );
    return error(`Invalid pointer=${invalid}`, 400);
  }
  const town = getTownToken(context.env);

  const totalSupply = await town.read.totalSupply();

  const ids = getTokenIdsFromPointers(`${totalSupply}`, pointers);

  const entities = await Promise.all(
    ids.map((id) => getEntity(context.env.storage, id))
  );

  return json(entities);
};
