import { servePage } from "../lib/explorer";

export const onRequestGet: PagesFunction<{ ASSETS: Fetcher }> = ({ request, env }) =>
  servePage(request, env.ASSETS, "/play/app");
