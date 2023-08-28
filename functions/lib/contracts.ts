import { ethers, JsonRpcProvider } from "ethers";
import AuctionHouseABI from "@exodus.town/contracts/abi/AuctionHouse.json";
import { AuctionHouse } from "@exodus.town/contracts";
import { Env } from "./env";

export function getProvider(env: Env) {
  return new JsonRpcProvider(env.RPC_URL);
}

export function getAuction(env: Env) {
  const provider = getProvider(env);
  const instance = new ethers.Contract(
    env.AUCTION_HOUSE_CONTRACT_ADDRESS,
    AuctionHouseABI,
    provider
  ) as unknown as AuctionHouse;
  return instance;
}
