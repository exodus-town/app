import { RPC, Transport } from "@dcl/mini-rpc";

// Host side of the inspector's "SceneRpcInbound" RPC. @dcl/inspector 7.x merged the old UI and
// camera RPCs into this one server and no longer exports a client for it.
type Params = {
  toggle_component: { component: string; enabled: boolean };
  toggle_panel: { panel: string; enabled: boolean };
  toggle_gizmos: { enabled: boolean };
  select_assets_tab: { tab: string };
  toggle_ground_grid: { enabled: boolean };
  set_camera_position: { x: number; y: number; z: number };
  set_camera_target: { x: number; y: number; z: number };
  take_screenshot: { width: number; height: number; precision?: number };
};
type Method = keyof Params;
type Result = { [K in Method]: K extends "take_screenshot" ? string : void };

export class SceneClient extends RPC<Method, Params, Result> {
  constructor(transport: Transport) {
    super("SceneRpcInbound", transport);
  }
  toggleComponent = (component: string, enabled: boolean) =>
    this.request("toggle_component", { component, enabled });
  togglePanel = (panel: string, enabled: boolean) =>
    this.request("toggle_panel", { panel, enabled });
  toggleGizmos = (enabled: boolean) =>
    this.request("toggle_gizmos", { enabled });
  selectAssetsTab = (tab: string) => this.request("select_assets_tab", { tab });
  toggleGroundGrid = (enabled: boolean) =>
    this.request("toggle_ground_grid", { enabled });
  setPosition = (x: number, y: number, z: number) =>
    this.request("set_camera_position", { x, y, z });
  setTarget = (x: number, y: number, z: number) =>
    this.request("set_camera_target", { x, y, z });
  takeScreenshot = (width: number, height: number) =>
    this.request("take_screenshot", { width, height });
}

// Host side of the inspector's "IframeStorage" RPC: the inspector reads and writes the scene's
// files through it.
type StorageParams = {
  read_file: { path: string };
  write_file: { path: string; content: Buffer };
  exists: { path: string };
  delete: { path: string };
  rmdir: { path: string };
  list: { path: string };
  stat: { path: string };
};
type StorageResult = {
  read_file: Buffer;
  write_file: void;
  exists: boolean;
  delete: void;
  rmdir: void;
  list: { name: string; isDirectory: boolean }[];
  stat: { size: number };
};

export class StorageServer extends RPC<
  keyof StorageParams,
  StorageParams,
  StorageResult
> {
  constructor(transport: Transport) {
    super("IframeStorage", transport);
  }
}
