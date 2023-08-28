import { ethers, JsonRpcProvider } from "ethers";
import TownTokenABI from "@exodus.town/contracts/abi/TownToken.json";
import AuctionHouseABI from "@exodus.town/contracts/abi/AuctionHouse.json";
import { AuctionHouse, TownToken } from "@exodus.town/contracts";
import { Env } from "./env";

export function getProvider(env: Env) {
  return new JsonRpcProvider(env.RPC_URL);
}

export function getAuctionHouse(env: Env) {
  const provider = getProvider(env);
  const contract = new ethers.Contract(
    env.AUCTION_HOUSE_CONTRACT_ADDRESS,
    AuctionHouseABI,
    provider
  );
  return contract as unknown as AuctionHouse;
}

export function getTownToken(env: Env) {
  const provider = getProvider(env);
  const contract = new ethers.Contract(
    env.TOWN_TOKEN_CONTRACT_ADDRESS,
    TownTokenABI,
    provider
  );
  return contract as unknown as TownToken;
}