import { createPublicClient, getContract, http } from "viem";
import { auctionHouseABI, townTokenABI } from "@exodus.town/contracts";
import { Env } from "./env";

export function getClient(env: Env) {
  const client = createPublicClient({
    // TODO: add another provider as fallback: fallback([http(RPC_1), http(RPC_2)])
    transport: http(env.RPC_URL),
  });
  return client;
}

export function getAuctionHouse(env: Env) {
  const client = getClient(env);
  const contract = getContract({
    publicClient: client,
    address: env.AUCTION_HOUSE_CONTRACT_ADDRESS,
    abi: auctionHouseABI,
  });
  return contract;
}

export function getTownToken(env: Env) {
  const client = getClient(env);
  const contract = getContract({
    publicClient: client,
    address: env.TOWN_TOKEN_CONTRACT_ADDRESS,
    abi: townTokenABI,
  });
  return contract;
}
