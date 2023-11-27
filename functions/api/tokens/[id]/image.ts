import { Env } from "../../../lib/env";
import { getMappings, toCoords, toId } from "../../../lib/coords";
import { error } from "../../../lib/response";

enum Colors {
  EVEN = `#100e13`,
  ODD = `#0c0b0e`,
  PARCEL = `#716c7a`,
  FILL = `#e153ef`,
  BORDER = `#a433b1`,
}

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const tokenId = context.params.id as string;
  if (isNaN(+tokenId) || +tokenId < 0)
    return error(`Invalid tokenId=${tokenId}`, 400);

  const tiles: string[] = [];

  const width = 512;
  const height = 512;
  const size = 15;
  const padding = 2;

  const horizontal = Math.ceil(width / size);
  const vertical = Math.ceil(height / size);

  const [centerX, centerY] = toCoords(tokenId);

  const startX = Math.ceil(centerX - horizontal / 2);
  const startY = Math.ceil(centerY - vertical / 2);

  const mappings = getMappings(tokenId);

  for (let h = 0; h < horizontal; h++) {
    for (let v = 0; v < vertical; v++) {
      const x = startX + h;
      const y = startY + v;
      const isCenter = x === centerX && y === centerY;
      if (isCenter) {
        console.log(x, y, v, h);
      }
      const id = toId(x, y);
      const exists = id in mappings;
      tiles.push(
        `<rect width="${size - padding}" height="${size - padding}" fill="${
          isCenter
            ? Colors.FILL
            : exists
            ? Colors.PARCEL
            : (h + v) % 2 === 0
            ? Colors.ODD
            : Colors.EVEN
        }" x="${h * size}" y="${height - (height % size) - v * size}" />`
      );
    }
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}px" height="${height}px" version="1.1">
    <title>Exodus Town</title>
    <desc>Parcel ${centerX},${centerY} of Exodus Town</desc>
    <rect width="${width}" height="${height}" fill="#000000"/>
    ${tiles.join("\n")}
</svg>
`;

  const response = new Response(svg);
  response.headers.set("Content-Type", "image/svg+xml");
  return response;
};
