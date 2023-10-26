import { Path } from "./constants";
import { toLayout } from "./layout";

type ComponentData = {
  name: string;
  data: Record<string, unknown>;
};

export function createComposite(tokenId: string) {
  const { base, parcels } = toLayout(tokenId);
  const gltf: ComponentData = {
    name: "core::GltfContainer",
    data: {},
  };
  const transform: ComponentData = {
    name: "core::Transform",
    data: {},
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
        value: `Ground ${i + 1}`,
      },
    };
    children.push(entity);
  }
  return {
    components: [
      {
        name: "inspector::Scene",
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
      },
      gltf,
      transform,
      name,
      nodes,
    ],
  };
}
