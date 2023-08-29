import { config } from "./config";

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
