import { useMemo } from "react";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { useJSON } from "./json";
import { MERKLE_ROOT, SNAPSHOT_URL } from "../lib/unwind";

export type Snapshot = {
  chainId: number;
  town: string;
  blockNumber: number;
  totalAllocation: string;
  refunds: { tokenId: string; amount: string; winner: string }[];
};

/**
 * The unwind snapshot: the MANA each plot sold for at auction. Its Merkle tree is rebuilt here and
 * checked against the root committed in TownRefund before any proof is used.
 */
export const useSnapshot = () => {
  const { data, error, isLoading } = useJSON(SNAPSHOT_URL);
  const snapshot = data as Snapshot | undefined;

  const amounts = useMemo(
    () => new Map(snapshot?.refunds.map((r) => [r.tokenId, BigInt(r.amount)])),
    [snapshot]
  );

  const tree = useMemo(() => {
    if (!snapshot) return undefined;
    const tree = StandardMerkleTree.of(
      snapshot.refunds.map((r) => [
        String(snapshot.chainId),
        snapshot.town,
        r.tokenId,
        r.amount,
      ]),
      ["uint256", "address", "uint256", "uint256"]
    );
    if (tree.root !== MERKLE_ROOT) throw new Error("Unwind snapshot root mismatch");
    return tree;
  }, [snapshot]);

  const getProof = (tokenId: string) => {
    const index = snapshot?.refunds.findIndex((r) => r.tokenId === tokenId) ?? -1;
    if (!tree || index < 0) throw new Error(`TOWN #${tokenId} is not in the snapshot`);
    return tree.getProof(index) as `0x${string}`[];
  };

  return { snapshot, amounts, getProof, error, isLoading };
};
