import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { QueryClient } from "@tanstack/react-query";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { getChain } from "./eth";

export const walletConnectProjectId = "3fc6e87bfba56db006d7cc717107019f";
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [getChain()];

export const queryClient = new QueryClient();

export const metadata = {
  name: "Exodus Town",
  description: "Long live the serpent 🐍🌀",
  url: window.location.origin,
  icons: [`${window.location.origin}/logo.png`],
};

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId: walletConnectProjectId,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
