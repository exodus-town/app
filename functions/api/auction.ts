import { formatEther } from "viem";
import { Auction } from "../../src/types";
import { Env } from "../lib/env";
import { getAuctionHouse } from "../lib/contracts";
import { json } from "../lib/json";

export const onRequest: PagesFunction<Env> = async (context) => {
  const auctionHouse = getAuctionHouse(context.env);

  const [
    [tokenId, amount, startTime, endTime, bidder, settled],
    reserve,
    minBidIncrementPercentage,
  ] = await Promise.all([
    auctionHouse.read.auction(),
    auctionHouse.read.reservePrice(),
    auctionHouse.read.minBidIncrementPercentage(),
  ]);

  const auction: Auction = {
    tokenId: tokenId.toString(),
    amount: Number(formatEther(amount)),
    min: Math.max(
      Number(formatEther(reserve)),
      Math.ceil(
        Number(formatEther(amount)) * (1 + minBidIncrementPercentage / 100)
      )
    ),
    bidder,
    endTime: Number(endTime) * 1000,
    startTime: Number(startTime) * 1000,
    settled,
  };

  return json(auction);
};
