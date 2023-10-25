import { MessageTransport } from "@dcl/mini-rpc";
import { hashV1 } from "@dcl/hashing";
import { UiClient, IframeStorage } from "@dcl/inspector";
import { toCoords } from "../lib/coords";

type Options = {
  tokenId: string;
  isOwner: boolean;
};

export async function init(
  iframe: HTMLIFrameElement,
  { tokenId, isOwner }: Options
) {
  const transport = new MessageTransport(window, iframe.contentWindow!, "*");
  const ui = new UiClient(transport);
  const storage = new IframeStorage.Server(transport);

  wire(storage, { tokenId, isOwner });

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

function wire(storage: IframeStorage.Server, { tokenId, isOwner }: Options) {
  const mappings = new Map<string, string>();
  const contents = new Map<string, Buffer>();

  // read file
  storage.handle("read_file", async ({ path }) => {
    switch (path) {
      case "inspector-preferences.json": {
        return json({
          version: 1,
          data: {
            freeCameraInvertRotation: false,
            autosaveEnabled: true,
          },
        });
      }
      case "scene.json": {
        const [x, y] = toCoords(tokenId);
        const base = `${x},${y}`;
        return json({
          scene: {
            parcels: [base],
            base,
          },
        });
      }
      case "assets/scene/main.composite": {
        const [x, y] = toCoords(tokenId);
        return json({
          components: [
            {
              name: "inspector::Scene",
              data: {
                "0": {
                  json: {
                    layout: {
                      base: {
                        x,
                        y,
                      },
                      parcels: [
                        {
                          x,
                          y,
                        },
                      ],
                    },
                  },
                },
              },
            },
          ],
        });
      }
      default: {
        if (mappings.has(path)) {
          const hash = mappings.get(path)!;
          return contents.get(hash)!;
        }
        throw new Error(`Could not find content for path="${path}"`);
      }
    }
  });

  // write file
  storage.handle("write_file", async ({ path, content }) => {
    if (!isOwner) return;

    const isIgnored = ["scene.json", "inspector-preferences.json"];

    if (isIgnored.includes(path)) return;

    const isMutable = ["assets/scene/main.composite", "main.crdt"].includes(
      path
    );

    if (isMutable) {
      // upload mutable
    } else {
      const hash = await hashV1(content);
      mappings.set(path, hash);
      contents.set(hash, content);
    }
  });

  storage.handle("exists", async ({ path }) => {
    switch (path) {
      case "scene.json":
      case "assets/scene/main.composite":
      case "inspector-preferences.json": {
        return true;
      }
      default: {
        return mappings.has(path);
      }
    }
  });

  storage.handle("list", async ({ path }) => {
    const paths = [...mappings.keys(), "assets/scene/main.composite"];
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
