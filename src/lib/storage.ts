const batch = new Map<string, Blob>();
let timeout: NodeJS.Timeout | null = null;

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
    });
    if (resp.ok) {
      const data = await resp.json();
      console.log("response", data, resp.status);
    } else {
      console.log("Error", resp.status);
    }
  }, 500);
}
