// The Decentraland web explorer is served by this app under /play/ (copied from
// @dcl-regenesislabs/bevy-explorer-web by scripts/postinstall.ts), and the realm is this same
// origin: its /about and /api/contents are served by the Pages Functions.
export function getPlayUrl(position?: { x: number; y: number }) {
  const params = new URLSearchParams({ realm: window.location.origin });
  if (position) params.set("position", `${position.x},${position.y}`);
  return `/play/?${params}`;
}
