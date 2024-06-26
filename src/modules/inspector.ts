import { MessageTransport } from "@dcl/mini-rpc";
import { UiClient, IframeStorage, CameraClient } from "@dcl/inspector";
import { Path, getContentPath } from "../lib/path";
import { createPreferences } from "../lib/preferences";
import { hasSigned, remove, save, setSignedMessage } from "../lib/storage";
import { Entity, getEntity } from "../lib/entity";

type InitOptions = {
  tokenId: string;
  signedMessage?: string | null;
  isOwner?: boolean;
  onLoad?: (data: { isCLI: boolean }) => void;
};

export async function init(
  iframe: HTMLIFrameElement,
  { tokenId, isOwner, signedMessage, onLoad }: InitOptions
) {
  // set signed message
  if (signedMessage) {
    setSignedMessage(signedMessage);
  }

  // fetch entity
  const entity = await getEntity(tokenId);

  // transports and rpcs
  const transport = new MessageTransport(window, iframe.contentWindow!, "*");
  const ui = new UiClient(transport);
  const camera = new CameraClient(transport);
  const storage = new IframeStorage.Server(transport);

  const isCLI = !!(entity.metadata as { cli?: boolean }).cli;
  const canWrite = hasSigned() && !!isOwner && !isCLI;

  async function handleLoad() {
    if (canWrite) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const screenshot = await camera.takeScreenshot(1024, 1024);
      const buffer = Buffer.from(
        screenshot.slice("data:image/png;base64,".length),
        "base64"
      );
      await save(tokenId, Path.THUMBNAIL, buffer);
      await ui.toggleGizmos(true);
    }
    // callback
    onLoad && onLoad({ isCLI });
  }

  // wire handlers
  await wire(storage, { tokenId, canWrite, entity, onLoad: handleLoad });

  // setup ui
  const promises: Promise<unknown>[] = [];
  promises.push(ui.selectAssetsTab("AssetsPack"));
  promises.push(ui.toggleComponent("inspector::SceneMetadata", false));
  promises.push(ui.toggleGizmos(false));
  if (!canWrite) {
    promises.push(ui.togglePanel("assets", false));
    promises.push(ui.togglePanel("components", false));
    promises.push(ui.togglePanel("entities", false));
    promises.push(ui.togglePanel("toolbar", false));
    promises.push(ui.togglePanel("shortcuts", false));
    promises.push(ui.togglePanel("metrics", false));
    promises.push(ui.toggleGroundGrid(false));
  }
  await Promise.all(promises);

  return () => storage.dispose();
}

// storage

function json(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8");
}

type WireOptions = Omit<InitOptions, "signedMessage" | "isOwner" | "onLoad"> & {
  entity: Entity;
  canWrite: boolean;
  onLoad: () => void;
};
async function wire(
  storage: IframeStorage.Server,
  { tokenId, canWrite, entity, onLoad }: WireOptions
) {
  const mappings = new Map<string, string>();
  for (const { file, hash } of entity.content) {
    mappings.set(file, hash);
  }

  // read file
  storage.handle("read_file", async ({ path }) => {
    checkIdle();
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
    if (!canWrite) return;
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
    await remove(tokenId, path);
    mappings.delete(path);
  });

  // idle
  let timeout: NodeJS.Timeout | null = null;
  let loaded = false;
  function checkIdle() {
    if (onLoad && !loaded) {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        loaded = true;
        onLoad();
      }, 3000);
    }
  }
}

// unlock
export async function unlock(iframe: HTMLIFrameElement, signedMessage: string) {
  setSignedMessage(signedMessage);

  const transport = new MessageTransport(window, iframe.contentWindow!, "*");
  const ui = new UiClient(transport);

  // setup ui
  const promises: Promise<unknown>[] = [];
  promises.push(ui.toggleGizmos(true));
  promises.push(ui.togglePanel("assets", true));
  promises.push(ui.togglePanel("components", true));
  promises.push(ui.togglePanel("entities", true));
  promises.push(ui.togglePanel("toolbar", true));
  promises.push(ui.togglePanel("shortcuts", true));
  promises.push(ui.togglePanel("metrics", true));
  promises.push(ui.toggleGroundGrid(true));

  await Promise.all(promises);
}
