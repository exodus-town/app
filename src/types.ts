export type Auction = {
  tokenId: string;
  amount: number;
  min: number;
  startTime: number;
  endTime: number;
  bidder: string;
  settled: boolean;
};
