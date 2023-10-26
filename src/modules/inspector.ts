import { MessageTransport } from "@dcl/mini-rpc";
import { hashV1 } from "@dcl/hashing";
import { UiClient, IframeStorage } from "@dcl/inspector";
import { toLayout } from "../lib/layout";

type Options = {
  tokenId: string;
  isOwner: boolean;
};

type ComponentData = {
  name: string;
  data: Record<string, unknown>;
};

enum Path {
  FLOOR_MODEL = "assets/scene/ground/FloorBaseGrass_01.glb",
  FLOOR_TEXTURE = "assets/scene/ground/Floor_Grass01.png.png",
  PREFERENCES = "inspector-preferences.json",
  COMPOSITE = "assets/scene/main.composite",
  CRDT = "main.crdt",
  SCENE = "scene.json",
  JS = "bin/index.js",
}

enum Hash {
  FLOOR_MODEL = "bafkreibytthve4zjlvbcnadjec2wjex2etqxuqtluriefzwwl4qe2qynne",
  FLOOR_TEXTURE = "bafkreid2fuffvxm6w2uimphn4tyxyox3eewt3r67zbrewbdonkjb7bqzx4",
}

export async function init(
  iframe: HTMLIFrameElement,
  { tokenId, isOwner }: Options
) {
  const transport = new MessageTransport(window, iframe.contentWindow!, "*");
  const ui = new UiClient(transport);
  const storage = new IframeStorage.Server(transport);

  await wire(storage, { tokenId, isOwner });

  // setup ui
  const promises: Promise<unknown>[] = [];
  promises.push(ui.selectAssetsTab("AssetsPack"));
  promises.push(ui.toggleComponent("inspector::Scene", false));
  if (!isOwner) {
    promises.push(ui.toggleGizmos(false));
    promises.push(ui.togglePanel("assets", false));
    promises.push(ui.togglePanel("components", false));
    promises.push(ui.togglePanel("entities", false));
    promises.push(ui.togglePanel("toolbar", false));
  }
  await Promise.all(promises);
}

// storage

function json(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8");
}

async function getContent(hash: string) {
  const resp = await fetch(
    `https://builder-items.decentraland.org/contents/${hash}`
  );
  const arrayBuffer = await resp.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function wire(
  storage: IframeStorage.Server,
  { tokenId, isOwner }: Options
) {
  const mappings = new Map<string, string>();
  const contents = new Map<string, Buffer>();

  mappings.set(Path.FLOOR_MODEL, Hash.FLOOR_MODEL);
  mappings.set(Path.FLOOR_TEXTURE, Hash.FLOOR_TEXTURE);

  // read file
  storage.handle("read_file", async ({ path }) => {
    switch (path) {
      case Path.PREFERENCES: {
        return json({
          version: 1,
          data: {
            freeCameraInvertRotation: false,
            autosaveEnabled: true,
          },
        });
      }
      case Path.SCENE: {
        const { base, parcels } = toLayout(tokenId);
        return json({
          scene: {
            parcels: parcels.map(({ x, y }) => `${x},${y}`),
            base: `${base.x},${base.y}`,
          },
        });
      }
      case Path.COMPOSITE: {
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
        return json({
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
        });
      }
      default: {
        if (mappings.has(path)) {
          const hash = mappings.get(path)!;
          if (!contents.has(hash)) {
            const content = await getContent(hash);
            contents.set(hash, content);
          }
          return contents.get(hash)!;
        }
        throw new Error(`Could not find content for path="${path}"`);
      }
    }
  });

  // write file
  storage.handle("write_file", async ({ path, content }) => {
    if (!isOwner) return;

    const ignored: string[] = [Path.SCENE, Path.PREFERENCES];

    if (ignored.includes(path)) return;

    const mutable: string[] = [Path.COMPOSITE, Path.CRDT];

    if (mutable.includes(path)) {
      // upload mutable
    } else {
      const hash = await hashV1(content);
      mappings.set(path, hash);
      console.log("hash", hash);
      contents.set(hash, content);
    }
  });

  storage.handle("exists", async ({ path }) => {
    switch (path) {
      case Path.SCENE:
      case Path.COMPOSITE:
      case Path.PREFERENCES: {
        return true;
      }
      default: {
        return mappings.has(path);
      }
    }
  });

  storage.handle("list", async ({ path }) => {
    const paths = [...mappings.keys(), Path.COMPOSITE];
    const files: { name: string; isDirectory: boolean }[] = [];

    for (const _path of paths) {
      if (!_path.startsWith(path)) continue;

      const fileName = _path.substring(path.length);
      const slashPosition = fileName.indexOf("/");
      if (slashPosition !== -1) {
        const directoryName = fileName.substring(0, slashPosition);
        if (!files.find((item) => item.name === directoryName)) {
          files.push({ name: directoryName, isDirectory: true });
        }
      } else {
        files.push({ name: fileName, isDirectory: false });
      }
    }

    return files;
  });

  storage.handle("delete", async ({ path }) => {
    mappings.delete(path);
  });
}

// unlock
export async function unlock(iframe: HTMLIFrameElement) {
  const transport = new MessageTransport(window, iframe.contentWindow!, "*");
  const ui = new UiClient(transport);

  // setup ui
  const promises: Promise<unknown>[] = [];
  promises.push(ui.toggleGizmos(true));
  promises.push(ui.togglePanel("assets", true));
  promises.push(ui.togglePanel("components", true));
  promises.push(ui.togglePanel("entities", true));
  promises.push(ui.togglePanel("toolbar", true));

  await Promise.all(promises);
}
