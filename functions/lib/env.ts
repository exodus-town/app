export interface Env {
  MANA_TOKEN_CONTRACT_ADDRESS: `0x${string}`;
  TOWN_TOKEN_CONTRACT_ADDRESS: `0x${string}`;
  AUCTION_HOUSE_CONTRACT_ADDRESS: `0x${string}`;
  EXODUS_DAO_CONTRACT_ADDRESS: `0x${string}`;
  ALCHEMY_RPC_URL: string;
  INFURA_RPC_URL: string;
  storage: R2Bucket;
}
