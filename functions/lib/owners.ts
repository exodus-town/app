import { getAddress } from "viem";
import { REFUND_CONTRACT_ADDRESS, refundAbi } from "../../src/lib/unwind";
import { Owner } from "../../src/types";
import snapshot from "../../src/data/owners-snapshot.json";
import { Env } from "./env";
import { getClient } from "./contracts";

export type { Owner };

// The archive's owners are frozen in src/data/owners-snapshot.json (scripts/owners-snapshot.ts):
// they stay each plot's owner, with the right to publish to it, whatever happens to the TOWN
// token afterwards, including its return to the DAO.
const owners = snapshot.owners.map((owner) => getAddress(owner));

/** The snapshot owner of every plot, and whether the plot was returned through the unwind. */
export async function getOwners(env: Env): Promise<Owner[]> {
  const returned = await getClient(env).multicall({
    allowFailure: false,
    contracts: owners.map((_, id) => ({
      address: REFUND_CONTRACT_ADDRESS,
      abi: refundAbi,
      functionName: "claimed" as const,
      args: [BigInt(id)] as const,
    })),
  });
  return owners.map((owner, id) => ({ owner, returned: returned[id] }));
}

/** The snapshot owner of one plot, or null for a token minted after the snapshot. */
export function getSnapshotOwner(tokenId: string): `0x${string}` | null {
  const id = Number(tokenId);
  return Number.isInteger(id) && id >= 0 && id < owners.length ? owners[id] : null;
}
