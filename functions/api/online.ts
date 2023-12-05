import { Env } from "../lib/env";
import { error, json } from "../lib/response";

export const onRequest: PagesFunction<Env> = async () => {
  try {
    const resp = await fetch(
      "https://places.decentraland.org/api/worlds?names=exodustown.dcl.eth&offset=0&limit=1"
    );
    if (resp.ok) {
      const data = await resp.json<{ data: { user_count: number }[] }>();
      const users = data?.data[0]?.user_count || 0;
      return json({ users });
    }
  } catch (error) {
    // nothing
  }
  return error("Could not get online users", 500);
};
