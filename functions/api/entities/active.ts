import { getTownToken } from "../../lib/contracts";
import { getMappings, toId } from "../../lib/coords";
import { createEntity } from "../../lib/entity";
import { Env } from "../../lib/env";
import { SCENE_SIZE } from "../../lib/layout";
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

  const mappings = getMappings(`${totalSupply}`);

  function fromLayout(value: number) {
    return (value - (value % SCENE_SIZE)) / SCENE_SIZE;
  }

  function fromPointer(pointer: string) {
    const [x, y] = pointer.split(",").map((n) => +n);
    const id = toId(fromLayout(x), fromLayout(y));
    return mappings[id];
  }

  const ids = new Set<string>();
  for (const pointer of pointers) {
    const id = fromPointer(pointer);
    if (id) {
      ids.add(id);
    }
  }

  const entities = await Promise.all(
    Array.from(ids).map((id) => createEntity(context.env.storage, id))
  );

  return json(entities);
};
