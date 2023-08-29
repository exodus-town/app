import { w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import { configureChains, createConfig } from "wagmi";
import { polygon, polygonMumbai } from "wagmi/chains";

export const walletConnectProjectId = "3fc6e87bfba56db006d7cc717107019f";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygon, polygonMumbai],
  [w3mProvider({ projectId: walletConnectProjectId })]
);

export const config = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({
    chains,
    projectId: walletConnectProjectId,
  }),
  publicClient,
  webSocketPublicClient,
});

export { chains };
