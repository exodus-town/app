import { Env } from "../lib/env";
import { json } from "../lib/response";

export const onRequest: PagesFunction<Env> = async (context) => {
  const {
    AUCTION_HOUSE_CONTRACT_ADDRESS,
    EXODUS_DAO_CONTRACT_ADDRESS,
    MANA_TOKEN_CONTRACT_ADDRESS,
    TOWN_TOKEN_CONTRACT_ADDRESS,
  } = context.env;

  return json({
    AUCTION_HOUSE_CONTRACT_ADDRESS,
    EXODUS_DAO_CONTRACT_ADDRESS,
    MANA_TOKEN_CONTRACT_ADDRESS,
    TOWN_TOKEN_CONTRACT_ADDRESS,
  });
};
