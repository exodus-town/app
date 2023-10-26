import { toCoords } from "./coords";

export function toLayout(tokenId: number | string, size = 3) {
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
