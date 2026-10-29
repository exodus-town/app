// Snapshot of every plot's owner, frozen for the archive: src/data/owners-snapshot.json is who
// the site shows as each plot's owner and who may publish content to it.
//
//   RPC_URL=https://polygon.gateway.tenderly.co [BLOCK=<number>] npx tsx scripts/owners-snapshot.ts
//
// Without BLOCK it uses the latest block minus 64 confirmations. Re-running at the same block
// reproduces the file exactly.
import fs from "fs";
import { createPublicClient, getAddress, http } from "viem";
import { polygon } from "viem/chains";
import { townTokenABI } from "@exodus.town/contracts";
import prd from "../src/config/env/prd.json";

const client = createPublicClient({
  chain: polygon,
  transport: http(process.env.RPC_URL ?? "https://polygon.gateway.tenderly.co"),
});
const town = {
  address: prd.TOWN_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
  abi: townTokenABI,
};

const blockNumber = process.env.BLOCK
  ? BigInt(process.env.BLOCK)
  : (await client.getBlockNumber()) - 64n;
const block = await client.getBlock({ blockNumber });
const supply = await client.readContract({ ...town, functionName: "totalSupply", blockNumber });
const owners = await client.multicall({
  allowFailure: false,
  blockNumber,
  contracts: Array.from({ length: Number(supply) }, (_, id) => ({
    ...town,
    functionName: "ownerOf" as const,
    args: [BigInt(id)] as const,
  })),
});

const snapshot = {
  chainId: polygon.id,
  town: town.address,
  blockNumber: Number(blockNumber),
  blockHash: block.hash,
  timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
  owners: owners.map((owner) => getAddress(owner)),
};
fs.writeFileSync("src/data/owners-snapshot.json", JSON.stringify(snapshot, null, 2) + "\n");
console.log(
  `Snapshot of ${snapshot.owners.length} plots at block ${snapshot.blockNumber} (${snapshot.timestamp}), ` +
    `${new Set(snapshot.owners).size} distinct owners`
);
