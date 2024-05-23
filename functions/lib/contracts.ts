import { createPublicClient, fallback, http } from "viem";
import { Env } from "./env";
import { auctionHouseABI, townTokenABI } from "@exodus.town/contracts";

export function getClient(env: Env) {
  const client = createPublicClient({
    batch: {
      multicall: true,
    },
    transport: fallback([http(env.ALCHEMY_RPC_URL), http(env.INFURA_RPC_URL)]),
  });
  return client;
}

export function getAuctionHouse(env: Env) {
  return {
    address: env.AUCTION_HOUSE_CONTRACT_ADDRESS,
    abi: auctionHouseABI,
  };
}

export function getTownToken(env: Env) {
  return {
    address: env.TOWN_TOKEN_CONTRACT_ADDRESS,
    abi: townTokenABI,
  };
}
