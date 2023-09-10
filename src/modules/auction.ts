import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useGetAuctionQuery } from "./api";

export const useAuction = () => {
  const { address } = useAccount();
  const { data: auction, ...other } = useGetAuctionQuery();
  const isSettled = useMemo(() => {
    if (!auction) {
      return false;
    }
    return auction.settled || auction.endTime < Date.now();
  }, [auction]);

  const isWinner = isSettled && auction?.bidder === address;
  const maxTokenId =
    isSettled && !isWinner
      ? Number(auction?.tokenId) + 1
      : Number(auction?.tokenId);
  return {
    ...other,
    auction,
    isSettled,
    isWinner,
    maxTokenId,
  };
};
