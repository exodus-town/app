import { createAsyncThunk } from "@reduxjs/toolkit";
import { createWalletClient, custom, parseUnits, getContract } from "viem";
import { auctionHouseABI } from "@exodus.town/contracts";
import { AUCTION_HOUSE_CONTRACT_ADDRESS } from "../eth";
import { polygonMumbai } from "viem/chains";

const windowEthereum = window as unknown as Window & {
  ethereum: { request(...args: unknown[]): Promise<unknown> };
};

export const bid = createAsyncThunk(
  "auction/bid",
  async (params: { tokenId: string; amount: number }) => {
    const walletClient = createWalletClient({
      transport: custom(windowEthereum.ethereum),
    });

    const auctionHouse = getContract({
      address: AUCTION_HOUSE_CONTRACT_ADDRESS,
      abi: auctionHouseABI,
      walletClient,
    });

    const [account] = await walletClient.getAddresses();
    const hash = await auctionHouse.write.createBid(
      [BigInt(params.tokenId), parseUnits(params.amount.toString(), 18)],
      {
        chain: polygonMumbai,
        account,
      }
    );

    console.log(hash);
  }
);

export const reset = createAsyncThunk("auction/reset", async () => {
  const walletClient = createWalletClient({
    transport: custom(windowEthereum.ethereum),
  });

  const auctionHouse = getContract({
    address: AUCTION_HOUSE_CONTRACT_ADDRESS,
    abi: auctionHouseABI,
    walletClient,
  });

  const [account] = await walletClient.getAddresses();

  const hash = await auctionHouse.write.settleCurrentAndCreateNewAuction({
    chain: polygonMumbai,
    account,
  });

  console.log(hash);
});
