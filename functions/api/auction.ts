import { ethers } from "ethers";

import { Auction } from "../../src/types";
import { Env } from "../lib/env";
import { getAuction } from "../lib/contracts";
import { json } from "../lib/json";

export const onRequest: PagesFunction<Env> = async (context) => {
  const Auction = getAuction(context.env);

  const [{ tokenId, amount, bidder, startTime, endTime, settled }, reserve] =
    await Promise.all([Auction.auction(), Auction.reservePrice()]);

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
