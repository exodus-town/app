import { toCoords } from "../../lib/coords";
import { Env } from "../../lib/env";
import { json } from "../../lib/json";

export const onRequest: PagesFunction<Env, "id"> = async (context) => {
  const tokenId = context.params.id as string;
  const [x, y] = toCoords(tokenId);
  const name = `${x},${y}`;
  const result = {
    id: context.params.id,
    name,
    description: `Parcel ${name} at Exodus Town`,
    external_url: `https://play.decentraland.org?realm=exodus.town&position=${name}`,
    attributes: [
      { trait_type: "X", value: x, display_type: "number" },
      { trait_type: "Y", value: y, display_type: "number" },
    ],
    background_color: "ffffff",
  };
  return json(result);
};
