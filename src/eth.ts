import { Chain } from "viem";
import { config } from "./config";
import { polygonMumbai } from "viem/chains";
import { polygon } from "wagmi/chains";

export const MANA_TOKEN_CONTRACT_ADDRESS = config.get(
  "MANA_TOKEN_CONTRACT_ADDRESS"
)! as `0x${string}`;
export const TOWN_TOKEN_CONTRACT_ADDRESS = config.get(
  "TOWN_TOKEN_CONTRACT_ADDRESS"
)! as `0x${string}`;
export const AUCTION_HOUSE_CONTRACT_ADDRESS = config.get(
  "AUCTION_HOUSE_CONTRACT_ADDRESS"
)! as `0x${string}`;
export const EXODUS_DAO_CONTRACT_ADDRESS = config.get(
  "EXODUS_DAO_CONTRACT_ADDRESS"
)! as `0x${string}`;

export function getChain(): Chain {
  const chainId = config.get("CHAIN_ID");
  switch (chainId) {
    case "80001": {
      return polygonMumbai;
    }
    default: {
      return polygon;
    }
  }
}
