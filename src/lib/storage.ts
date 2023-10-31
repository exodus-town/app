import future from "fp-future";
import { SIGNED_MESSAGE_HEADER } from "./auth";

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

export function save(tokenId: string, path: string, content: Buffer) {
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
      const data = await resp.json();
      promise.resolve(data);
    } else {
      promise.reject(new Error(`Error: HTTP Status ${resp.status}`));
    }
    promise = future();
  }, 500);

  return promise;
}
