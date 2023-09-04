import { toCoords } from "../../lib/coords";
import { json } from "../../lib/json";

export const onRequest: PagesFunction = async (context) => {
  const tokenId = Number(context.params.id);
  if (isNaN(tokenId)) {
    throw new Error(`Invalid tokenId=${context.params.id}`);
  }
  if (tokenId < 0) {
    throw new Error(`Invalid tokenId can't be less than 0`);
  }
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
