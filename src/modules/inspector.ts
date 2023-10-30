import { MessageTransport } from "@dcl/mini-rpc";
import { UiClient, IframeStorage } from "@dcl/inspector";
import {
  Hash,
  Path,
  getContentPath,
  getHash,
  getMutableHash,
} from "../lib/mappings";
import { getComposite } from "../lib/composite";
import { createScene } from "../lib/scene";
import { createPreferences } from "../lib/preferences";
import { save } from "../lib/storage";
import { Entity } from "./entity";

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
  const resp = await fetch(getContentPath(hash));
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

  const entityHash = await getMutableHash(tokenId, Path.ENTITY);
  const entityPath = getContentPath(entityHash);
  console.log(entityPath);
  fetch(entityPath)
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
      return null;
    })
    .then((entity: Entity | null) => {
      if (entity) {
        for (const { file, hash } of entity.content) {
          mappings.set(file, hash);
        }
        console.log("new mappings", mappings);
      }
    });

  // read file
  storage.handle("read_file", async ({ path }) => {
    switch (path) {
      case Path.PREFERENCES: {
        const preferences = createPreferences();
        return json(preferences);
      }
      case Path.SCENE: {
        const scene = createScene(tokenId);
        return json(scene);
      }
      case Path.COMPOSITE: {
        const composite = await getComposite(tokenId);
        return json(composite);
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
    const hash = await getHash(path, content, tokenId);
    mappings.set(path, hash);
    contents.set(hash, content);

    console.log("write_file", path, hash);

    save(tokenId, path, content);
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
    const paths = [...mappings.keys()];
    if (!path.includes(Path.COMPOSITE)) {
      paths.push(Path.COMPOSITE);
    }
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
