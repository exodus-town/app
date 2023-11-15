import { useMemo } from "react";
import { useContractRead } from "wagmi";
import { formatEther } from "viem";
import { erc20ABI } from "@exodus.town/contracts";
import {
  EXODUS_DAO_CONTRACT_ADDRESS,
  MANA_TOKEN_CONTRACT_ADDRESS,
} from "../eth";
import { useJSON } from "./json";

export const usePrice = () => {
  const { data, error, isLoading } = useJSON(
    `https://api.coingecko.com/api/v3/simple/price?ids=decentraland&vs_currencies=usd`
  );
  const price = useMemo(
    () => (isLoading ? null : error ? null : data?.decentraland?.usd || null),
    [data, error, isLoading]
  );

  return { price, error, isLoading };
};

export const useTreasury = () => {
  const { price, error: priceError, isLoading: isLoadingPrice } = usePrice();

  const {
    data: balance,
    error: balanceError,
    isLoading: isLoadingBalance,
  } = useContractRead({
    abi: erc20ABI,
    address: MANA_TOKEN_CONTRACT_ADDRESS,
    functionName: "balanceOf",
    args: [EXODUS_DAO_CONTRACT_ADDRESS],
  });

  const treasury = useMemo(() => {
    if (price && balance) {
      const formatted = formatEther(balance);
      const parsed = parseFloat(formatted);
      const usd = price * parsed;
      return usd;
    }
    return null;
  }, [price, balance]);

  const error = priceError || balanceError;
  const isLoading = isLoadingPrice || isLoadingBalance;

  return { price, treasury, error, isLoading };
};
