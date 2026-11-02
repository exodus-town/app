// Cloudflare Pages redirects `/x.html` to `/x`, but the explorer's service worker
// (public/play/service_worker.js) isolates its app frame by matching the `app.html` and
// `engine/headless.html` paths. Serve those two pages at their .html URLs, from the static
// asset, so the worker sees the path it expects.
export async function servePage(
  request: Request,
  assets: Fetcher,
  prettyPath: string
) {
  const url = new URL(request.url);
  url.pathname = prettyPath;
  const asset = await assets.fetch(url.toString());
  return new Response(asset.body, {
    status: asset.status,
    headers: new Headers(asset.headers),
  });
}
