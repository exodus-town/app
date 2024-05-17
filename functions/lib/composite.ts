import { toLayout } from "./layout";
import { Path } from "./mappings";

type ComponentData = {
  name: string;
  data: Record<string, unknown>;
};

export function createComposite(tokenId: string) {
  const { base, parcels } = toLayout(tokenId);
  const metadata: ComponentData = {
    name: "inspector::SceneMetadata",
    data: {
      "0": {
        json: {
          layout: {
            base,
            parcels,
          },
        },
      },
    },
  };
  const gltf: ComponentData = {
    name: "core::GltfContainer",
    data: {},
  };
  const transform: ComponentData = {
    name: "core::Transform",
    data: {
      512: { json: { position: { x: 0, y: 0, z: 0 }, parent: 0 } },
    },
  };
  const name: ComponentData = {
    name: "core-schema::Name",
    data: {
      512: { json: { value: "Ground" } },
    },
  };
  const children: number[] = [];
  const nodes: ComponentData = {
    name: "inspector::Nodes",
    data: {
      "0": {
        json: {
          value: [
            {
              entity: 0,
              open: true,
              children: [512],
            },
            {
              entity: 512,
              open: false,
              children,
            },
          ],
        },
      },
    },
  };
  const lock: ComponentData = {
    name: "inspector::Lock",
    data: {
      512: { json: { value: true } },
    },
  };
  const ground: ComponentData = {
    name: "inspector::Ground",
    data: {
      512: { json: {} },
    },
  };

  const tile: ComponentData = {
    name: "inspector::Tile",
    data: {},
  };

  for (let i = 0; i < parcels.length; i++) {
    const entity = 513 + i;
    gltf.data[entity] = {
      json: {
        src: Path.FLOOR_MODEL,
      },
    };
    const { x, y } = parcels[i];
    transform.data[entity] = {
      json: {
        position: {
          x: 16 * x + 8 - base.x * 16,
          y: 0,
          z: 16 * y + 8 - base.y * 16,
        },
      },
    };
    name.data[entity] = {
      json: {
        value: `Tile ${i + 1}`,
      },
    };
    lock.data[entity] = {
      json: {
        value: true,
      },
    };
    tile.data[entity] = {
      json: {},
    };

    children.push(entity);
  }
  return {
    components: [metadata, gltf, transform, name, nodes, lock, ground, tile],
  };
}
