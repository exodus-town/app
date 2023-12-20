import { Env } from "./lib/env";
import { error } from "./lib/response";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const data = await context.request.formData();

  // save file
  for (const [path, content] of data) {
    console.log(path, content);
  }

  return error("Not implemented", 501);
};
