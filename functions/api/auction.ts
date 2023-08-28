import { ethers } from "ethers";

import { Auction } from "../../src/types";
import { Env } from "../lib/env";
import { getAuctionHouse } from "../lib/contracts";
import { json } from "../lib/json";

export const onRequest: PagesFunction<Env> = async (context) => {
  const AuctionHouse = getAuctionHouse(context.env);

  const [{ tokenId, amount, bidder, startTime, endTime, settled }, reserve] =
    await Promise.all([AuctionHouse.auction(), AuctionHouse.reservePrice()]);

  const auction: Auction = {
    tokenId: tokenId.toString(),
    amount: Number(ethers.formatEther(amount)),
    reserve: Number(ethers.formatEther(reserve)),
    bidder,
    endTime: Number(endTime) * 1000,
    startTime: Number(startTime) * 1000,
    settled,
  };

  return json(auction);
};
