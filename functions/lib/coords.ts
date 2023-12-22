import { toLayout } from "./layout";

export function toCoords(tokenId: number | string): [number, number] {
  const id = typeof tokenId === "string" ? Number(tokenId) : tokenId;
  if (isNaN(id)) {
    throw new Error(`Invalid tokenId=${tokenId}`);
  }
  if (id < 0) {
    throw new Error(`Invalid tokenId can't be less than 0`);
  }
  const dx = [1, 0, -1, 0];
  const dy = [0, 1, 0, -1];
  let x = 0;
  let y = 0;
  let turn = 0;
  let step = 0;
  let length = 1;
  let increase = false;
  while (step < id) {
    for (let i = 0; i < length; i++) {
      x += dx[turn % 4];
      y += dy[turn % 4];
      step++;
      if (step === id) break;
    }
    if (increase) {
      length++;
      increase = false;
    } else {
      increase = true;
    }
    turn++;
  }
  return [x, y];
}

export function toId(x: number, y: number) {
  return `${x},${y}`;
}

export function getCoordsToTokenIdMappings(
  maxTokenId: number | string
): Record<string, string> {
  const id = typeof maxTokenId === "string" ? Number(maxTokenId) : maxTokenId;
  if (isNaN(id)) {
    throw new Error(`Invalid maxTokenId=${maxTokenId}`);
  }
  if (id < 0) {
    throw new Error(`Invalid maxTokenId can't be less than 0`);
  }
  const mappings: Record<string, string> = {
    [toId(0, 0)]: "0",
  };
  const dx = [1, 0, -1, 0];
  const dy = [0, 1, 0, -1];
  let x = 0;
  let y = 0;
  let turn = 0;
  let step = 0;
  let length = 1;
  let increase = false;
  while (step < id) {
    for (let i = 0; i < length; i++) {
      x += dx[turn % 4];
      y += dy[turn % 4];
      step++;
      mappings[toId(x, y)] = step.toString();
      if (step === id) break;
    }
    if (increase) {
      length++;
      increase = false;
    } else {
      increase = true;
    }
    turn++;
  }
  return mappings;
}

export function getPointerToTokenIdMappings(maxTokenId: string | number) {
  const id = typeof maxTokenId === "string" ? Number(maxTokenId) : maxTokenId;
  if (isNaN(id)) {
    throw new Error(`Invalid maxTokenId=${maxTokenId}`);
  }
  if (id < 0) {
    throw new Error(`Invalid maxTokenId can't be less than 0`);
  }
  const mappings: Record<string, string> = {};
  for (let tokenId = 0; tokenId <= id; tokenId++) {
    const layout = toLayout(tokenId);
    for (const parcel of layout.parcels) {
      mappings[toId(parcel.x, parcel.y)] = tokenId.toString();
    }
  }
  return mappings;
}

export function getTokenIdsFromPointers(
  maxTokenId: string | number,
  pointers: string[]
) {
  const mappings = getPointerToTokenIdMappings(maxTokenId);

  console.log("mappings", mappings);

  const ids = new Set<string>();
  for (const pointer of pointers) {
    const id = mappings[pointer];
    console.log("fromPointer", pointer, id);
    if (id) {
      ids.add(id);
    }
  }

  return Array.from(ids);
}
