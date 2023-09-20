import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useGetAuctionQuery } from "./api";
import { ZERO_ADDRRESS } from "../eth";

export const useAuction = () => {
  const { address } = useAccount();
  const { data: auction, ...other } = useGetAuctionQuery();
  const isSettled = useMemo(() => {
    if (!auction) {
      return false;
    }
    return auction.settled || auction.endTime < Date.now();
  }, [auction]);

  const hasBidder = useMemo(() => {
    if (!auction) {
      return false;
    }
    return auction.bidder !== ZERO_ADDRRESS;
  }, [auction]);

  const isWinner = isSettled && auction?.bidder === address;
  const maxTokenId = auction
    ? isSettled && hasBidder && !isWinner
      ? Number(auction.tokenId) + 1
      : Number(auction.tokenId)
    : 0;
  console.log(auction, maxTokenId, isSettled, hasBidder, isWinner);
  return {
    ...other,
    auction,
    isSettled,
    isWinner,
    maxTokenId,
    hasBidder,
  };
};
