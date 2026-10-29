import { error } from "./lib/response";

// The web explorer asks a realm for `/scenes` (a worlds-server listing) and skips it on a 404.
// Without this route the SPA fallback would answer with index.html and break the realm change.
export const onRequest: PagesFunction = async () => error("Not found", 404);
