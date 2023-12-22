import future from "fp-future";
import { SIGNED_MESSAGE_HEADER } from "./auth";
import { Entity } from "./entity";

const batch = new Map<string, Blob>();
let timeout: NodeJS.Timeout | null = null;
let promise = future();

let signedMessage: string | null = null;

export function setSignedMessage(_signedMessage: string) {
  signedMessage = _signedMessage;
}

export function hasSigned() {
  return !!signedMessage;
}

export function save(
  tokenId: string,
  path: string,
  content: Buffer
): Promise<Entity> {
  const blob = new Blob([content]);

  batch.set(path, blob);

  if (timeout) {
    clearTimeout(timeout);
  }

  timeout = setTimeout(async () => {
    const formData = new FormData();
    for (const [path, blob] of batch) {
      formData.append(path, blob);
    }
    batch.clear();
    const resp = await fetch(`/api/tokens/${tokenId}`, {
      method: "post",
      body: formData,
      headers: {
        [SIGNED_MESSAGE_HEADER]: signedMessage!,
      },
    });
    if (resp.ok) {
      const entity: Entity = await resp.json();
      promise.resolve(entity);
    } else {
      promise.reject(new Error(`Error: HTTP Status ${resp.status}`));
    }
    promise = future();
  }, 500);

  return promise;
}

export async function remove(tokenId: string, path: string) {
  const formData = new FormData();
  formData.append(path, "");
  const resp = await fetch(`/api/tokens/${tokenId}`, {
    method: "delete",
    body: formData,
    headers: {
      [SIGNED_MESSAGE_HEADER]: signedMessage!,
    },
  });
  if (resp.ok) {
    const entity: Entity = await resp.json();
    return entity;
  } else {
    new Error(`Error: HTTP Status ${resp.status}`);
  }
}

export async function reset(tokenId: string) {
  const resp = await fetch(`/api/tokens/${tokenId}/reset`, {
    method: "post",
    headers: {
      [SIGNED_MESSAGE_HEADER]: signedMessage!,
    },
  });
  if (resp.ok) {
    const entity: Entity = await resp.json();
    return entity;
  } else {
    new Error(`Error: HTTP Status ${resp.status}`);
  }
}
