import { MessageTransport } from "@dcl/mini-rpc";
import { UiClient, IframeStorage } from "@dcl/inspector";
import { Path, getContentPath } from "../lib/path";
import { createPreferences } from "../lib/preferences";
import { save } from "../lib/storage";
import { Entity } from "../lib/entity";
import { About } from "../lib/about";

type InitOptions = {
  tokenId: string;
  isOwner: boolean;
};

export async function init(
  iframe: HTMLIFrameElement,
  { tokenId, isOwner }: InitOptions
) {
  // fetch entity
  const aboutResponse = await fetch(`/${tokenId}/about`);
  const about: About = await aboutResponse.json();
  const urn = about.configurations.scenesUrn[0];
  const entityId = urn.split("?")[0].split(":").pop()!;
  const entityResponse = await fetch(getContentPath(entityId));
  const entity: Entity = await entityResponse.json();

  // transports and rpcs
  const transport = new MessageTransport(window, iframe.contentWindow!, "*");
  const ui = new UiClient(transport);
  const storage = new IframeStorage.Server(transport);

  // wire handlers
  await wire(storage, { tokenId, isOwner, entity });

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

type WireOptions = InitOptions & {
  entity: Entity;
};
async function wire(
  storage: IframeStorage.Server,
  { tokenId, isOwner, entity }: WireOptions
) {
  const mappings = new Map<string, string>();
  for (const { file, hash } of entity.content) {
    mappings.set(file, hash);
  }

  // read file
  storage.handle("read_file", async ({ path }) => {
    switch (path) {
      case Path.PREFERENCES: {
        const preferences = createPreferences();
        return json(preferences);
      }
      default: {
        const hash = mappings.get(path)!;
        const resp = await fetch(getContentPath(hash));
        const arrayBuffer = await resp.arrayBuffer();
        const content = Buffer.from(arrayBuffer);
        return content;
      }
    }
  });

  // write file
  storage.handle("write_file", async ({ path, content }) => {
    if (!isOwner) return;
    const entity = await save(tokenId, path, content);
    for (const { file, hash } of entity.content) {
      mappings.set(file, hash);
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
    const paths = [...mappings.keys()];
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
