import { useCallback, useMemo } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useContractRead, useContractReads } from "wagmi";
import { townTokenABI } from "@exodus.town/contracts";
import { TOWN_TOKEN_CONTRACT_ADDRESS } from "../eth";
import { toCoords } from "../lib/coords";

export const useTown = () => {
  const { address } = useAccount();

  const { data: balance, refetch: refetchBalance } = useContractRead({
    abi: townTokenABI,
    address: TOWN_TOKEN_CONTRACT_ADDRESS,
    functionName: "balanceOf",
    args: [address!],
  });

  const indexes = useMemo(() => {
    const indexes: number[] = [];
    if (balance) {
      const maxIndex = +formatUnits(balance, 0);
      if (maxIndex > 0) {
        for (let i = 0; i < maxIndex; i++) {
          indexes.push(i);
        }
      }
    }
    return indexes;
  }, [balance]);

  const { data: tokens, refetch: refetchTokens } = useContractReads({
    contracts: indexes.map((index) => ({
      abi: townTokenABI,
      address: TOWN_TOKEN_CONTRACT_ADDRESS,
      functionName: "tokenOfOwnerByIndex",
      args: [address!, parseUnits(index.toString(), 0)],
    })),
  });

  const tokenIds = useMemo(() => {
    if (tokens) {
      return tokens
        .filter(
          ({ status, result }) =>
            status === "success" && typeof result !== "undefined"
        )
        .map(({ result }) => formatUnits(result as bigint, 0));
    }
    return [];
  }, [tokens]);

  const ownedCoords = useMemo(() => {
    return new Set(
      tokenIds?.map((tokenId) => {
        const [x, y] = toCoords(tokenId);
        return `${x},${y}`;
      })
    );
  }, [tokenIds]);

  const reload = useCallback(() => {
    refetchBalance();
    refetchTokens();
  }, [refetchBalance, refetchTokens]);

  return { balance, tokenIds, ownedCoords, reload };
};
