import { createPublicClient, fallback, getAddress, http } from "viem";
import { polygon } from "viem/chains";
import { townTokenABI } from "@exodus.town/contracts";
import {
  REFUND_CONTRACT_ADDRESS,
  REFUND_DEPLOY_BLOCK,
  refundAbi,
} from "../../src/lib/unwind";
import { Owner } from "../../src/types";
import { Env } from "./env";
import { getClient } from "./contracts";

export type { Owner };

// Event scans need wide eth_getLogs ranges, which keyed RPC plans often cap at a few blocks.
function getLogsClient(env: Env) {
  return createPublicClient({
    chain: polygon,
    transport: fallback([
      http("https://polygon.gateway.tenderly.co"),
      http(env.ALCHEMY_RPC_URL),
      http(env.INFURA_RPC_URL),
    ]),
  });
}

/** Who returned each plot, by token ID, from TownRefund's Refunded events. */
export async function getReturners(env: Env, tokenId?: bigint) {
  const client = getLogsClient(env);
  const latest = await client.getBlockNumber();
  const returners = new Map<string, `0x${string}`>();
  let from = REFUND_DEPLOY_BLOCK;
  let span = 100_000n;
  while (from <= latest) {
    const to = from + span - 1n > latest ? latest : from + span - 1n;
    try {
      const logs = await client.getContractEvents({
        address: REFUND_CONTRACT_ADDRESS,
        abi: refundAbi,
        eventName: "Refunded",
        args: tokenId === undefined ? undefined : { tokenId },
        fromBlock: from,
        toBlock: to,
        strict: true,
      });
      for (const log of logs) {
        returners.set(log.args.tokenId.toString(), getAddress(log.args.holder));
      }
      from = to + 1n;
    } catch (error) {
      if (span <= 1_000n) throw error;
      span /= 4n;
    }
  }
  return returners;
}

/** The owner of record of every minted plot, indexed by token ID. */
export async function getOwners(env: Env): Promise<Owner[]> {
  const client = getClient(env);
  const town = { address: env.TOWN_TOKEN_CONTRACT_ADDRESS, abi: townTokenABI };
  const supply = await client.readContract({ ...town, functionName: "totalSupply" });
  const [holders, returners] = await Promise.all([
    client.multicall({
      allowFailure: false,
      contracts: Array.from({ length: Number(supply) }, (_, id) => ({
        ...town,
        functionName: "ownerOf" as const,
        args: [BigInt(id)] as const,
      })),
    }),
    getReturners(env),
  ]);
  return holders.map((holder, id) => toOwner(env, holder, returners.get(String(id))));
}

/** The owner of record of one plot. */
export async function getOwner(env: Env, tokenId: string): Promise<Owner> {
  const client = getClient(env);
  const holder = await client.readContract({
    address: env.TOWN_TOKEN_CONTRACT_ADDRESS,
    abi: townTokenABI,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
  });
  const returner = isDAO(env, holder)
    ? (await getReturners(env, BigInt(tokenId))).get(tokenId)
    : undefined;
  return toOwner(env, holder, returner);
}

function isDAO(env: Env, address: string) {
  return address.toLowerCase() === env.EXODUS_DAO_CONTRACT_ADDRESS.toLowerCase();
}

function toOwner(env: Env, holder: `0x${string}`, returner?: `0x${string}`): Owner {
  // A returned plot sits in the DAO; its owner of record stays whoever returned it.
  return returner && isDAO(env, holder)
    ? { owner: returner, returned: true }
    : { owner: getAddress(holder), returned: false };
}
