export type Auction = {
  tokenId: string;
  amount: number;
  reserve: number;
  startTime: number;
  endTime: number;
  bidder: string;
  settled: boolean;
};
