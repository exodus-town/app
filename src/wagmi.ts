import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { QueryClient } from "@tanstack/react-query";
import { getChain } from "./eth";
import { Chain } from "viem";

export const walletConnectProjectId = "3fc6e87bfba56db006d7cc717107019f";
const chains: readonly [Chain, ...Chain[]] = [getChain()];

export const queryClient = new QueryClient();

const metadata = {
  name: "Exodus Town",
  description: "Long live the serpent 🐍🌀",
  url: "https://exodus.town",
  icons: ["https://exodus.town/logo.png"],
};

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId: walletConnectProjectId,
  metadata,
});

export { chains };
