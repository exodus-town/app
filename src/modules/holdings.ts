import { useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { townTokenABI } from "@exodus.town/contracts";
import { TOWN_TOKEN_CONTRACT_ADDRESS } from "../eth";

const town = { abi: townTokenABI, address: TOWN_TOKEN_CONTRACT_ADDRESS } as const;

/**
 * The TOWN tokens the connected account holds onchain right now. Returning a plot needs the
 * current holder, which can differ from its owner in the archive's snapshot.
 */
export const useHoldings = () => {
  const { address } = useAccount();
  const { data: balance, refetch: refetchBalance } = useReadContract({
    ...town,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address },
  });
  const { data, refetch: refetchTokens } = useReadContracts({
    allowFailure: false,
    contracts: Array.from({ length: Number(balance ?? 0n) }, (_, index) => ({
      ...town,
      functionName: "tokenOfOwnerByIndex" as const,
      args: [address!, BigInt(index)] as const,
    })),
    query: { enabled: !!address && !!balance },
  });
  const tokenIds = useMemo(
    () => (data ?? []).map((id) => String(id)).sort((a, b) => Number(a) - Number(b)),
    [data]
  );
  return {
    tokenIds,
    reload: () => {
      refetchBalance();
      refetchTokens();
    },
  };
};
