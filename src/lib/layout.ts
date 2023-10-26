import { SCENE_SIZE } from "./constants";
import { toCoords } from "./coords";

export function toLayout(tokenId: number | string, size = SCENE_SIZE) {
  const [x, y] = toCoords(tokenId);
  const base = { x: x * size, y: y * size };
  const parcels: { x: number; y: number }[] = [];
  for (let $x = base.x; $x < base.x + size; $x++) {
    for (let $y = base.y; $y < base.y + size; $y++) {
      parcels.push({ x: $x, y: $y });
    }
  }
  return { base, parcels };
}
