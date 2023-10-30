import { Path } from "./mappings";
import { toCoords } from "./coords";
import { toLayout } from "./layout";

export function createScene(tokenId: string) {
  const [x, y] = toCoords(tokenId);
  const { base, parcels } = toLayout(tokenId);
  return {
    ecs7: true,
    runtimeVersion: "7",
    display: {
      title: `Parcel ${x},${y}`,
      description: `Parcel ${x},${y} on Exodus Town`,
      navmapThumbnail: Path.NAVMAP_THUMBNAIL,
    },
    scene: {
      parcels: parcels.map(({ x, y }) => `${x},${y}`),
      base: `${base.x},${base.y}`,
    },
    main: "bin/index.js",
  };
}
