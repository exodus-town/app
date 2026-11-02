import { useReadContracts } from "wagmi";
import { REFUND_CONTRACT_ADDRESS, refundAbi } from "../lib/unwind";
import { useTown } from "./town";
import { useSnapshot } from "./snapshot";

const refund = { address: REFUND_CONTRACT_ADDRESS, abi: refundAbi } as const;

/** How far the unwind has gone: MANA left in the refund contract and plots returned. */
export const useUnwindProgress = () => {
  const { owners } = useTown();
  const { snapshot } = useSnapshot();
  const { data, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...refund, functionName: "active" },
      { ...refund, functionName: "totalAllocation" },
      { ...refund, functionName: "remainingAllocation" },
    ],
    query: { refetchInterval: 60_000 },
  });
  const [isActive, total, active] = [data?.[0], data?.[1], data?.[2]];
  // Before activation nothing has been refunded: all of it is still to come.
  const remaining = isActive ? active : total;
  const parcels = snapshot?.refunds.length;
  const returned = owners.filter((o) => o.returned).length;
  return {
    isLoading: isLoading || !snapshot,
    isActive: !!isActive,
    total,
    remaining,
    parcels,
    returned,
    isComplete: !!isActive && remaining === 0n,
  };
};
