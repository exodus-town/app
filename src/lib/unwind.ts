// ExodusDAO proposal #9 ("Refund Exodus Town"): unwinds the DAO. Once executed, every plot in the
// snapshot can be returned to the DAO through TownRefund for the MANA paid at its auction.
// Pinned from github.com/exodus-town/refund (src/deployment.js); the proposal ID is derived from
// these exact actions and description, so they must not change.

export const REFUND_CONTRACT_ADDRESS = "0x4597d46C178C0B11d0F17ACb62bE81555D471524" as const;
export const SNAPSHOT_URL = "/unwind/0x11cb2dc9e270fca11a72ec801cd20b34856f7925aa549b98437aad2cd08bc9da.json";
export const SNAPSHOT_HASH = "0x11cb2dc9e270fca11a72ec801cd20b34856f7925aa549b98437aad2cd08bc9da";
export const MERKLE_ROOT = "0xb37eb4c5eac13888782e8ad9a820240e4701363e3727b838344516aa35b1b4e6";
export const PROPOSAL_NUMBER = 9;
export const PROPOSAL_ID = 109081609158717326940535053193722669125280727004013537787103873027278016885048n;
export const PROPOSAL_TRANSACTION = "0xf00204dcf39c04826316b99e6a4d88d812fbdb194a9c22818beb083d23df2fb5";
export const PROPOSAL = {
  targets: ["0x0Ff58e235b154dd7785C4829D48948CE114248C4","0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4","0x4597d46C178C0B11d0F17ACb62bE81555D471524"] as `0x${string}`[],
  values: [0n, 0n, 0n],
  calldatas: ["0x8456cb59","0xa9059cbb0000000000000000000000004597d46c178c0b11d0f17acb62be81555d47152400000000000000000000000000000000000000000000056a1ddff9d4a2860000","0x0f15f4c0"] as `0x${string}`[],
  description: "Refund Exodus Town\n\nExchange each eligible TOWN NFT for the MANA paid in its settled auction. Rights follow the current NFT holder. Refunded NFTs are transferred to ExodusDAO. Individual and bulk refunds are supported. No claim deadline.\n\nChain: 137\nSnapshot block: 96050645\nSnapshot block hash: 0x9fdcb590367e89bb6603863a0778feacb03e39f4e73a77c0a944d1d955c674f7\nSnapshot data: https://raw.githubusercontent.com/exodus-town/refund/main/public/snapshots/0x11cb2dc9e270fca11a72ec801cd20b34856f7925aa549b98437aad2cd08bc9da.json\nSnapshot file keccak256: 0x11cb2dc9e270fca11a72ec801cd20b34856f7925aa549b98437aad2cd08bc9da\nMerkle root: 0xb37eb4c5eac13888782e8ad9a820240e4701363e3727b838344516aa35b1b4e6\nEligible NFTs: 229\nTotal MANA (base units): 25569340000000000000000\nRedemption contract: 0x4597d46C178C0B11d0F17ACb62bE81555D471524\n\nOnly settled, positive-price auctions through the snapshot block are eligible. Later auctions and mints are excluded. The active auction is not settled by this proposal. Pause auctions, then Transfer the exact allocation from the DAO treasury and activate redemption atomically. Publish the complete snapshot file with this proposal so anyone can reproduce the root.\n\nThis proposal distributes MANA only; it does not liquidate any other DAO assets.",
  descriptionHash: "0x41e7c16b66aa85c7dd59fce7bc7c2ff98dcfbf0ce9783062ca940b4225345c97" as `0x${string}`,
};

export const refundAbi = [
  { type: "function", name: "active", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "merkleRoot", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
  { type: "function", name: "remainingAllocation", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalAllocation", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "claimed", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "refund", stateMutability: "nonpayable", inputs: [{ name: "tokenId", type: "uint256" }, { name: "amount", type: "uint256" }, { name: "proof", type: "bytes32[]" }], outputs: [] },
  { type: "function", name: "refundBatch", stateMutability: "nonpayable", inputs: [{ name: "tokenIds", type: "uint256[]" }, { name: "amounts", type: "uint256[]" }, { name: "proofs", type: "bytes32[][]" }], outputs: [] },
  { type: "event", name: "Refunded", inputs: [{ name: "holder", type: "address", indexed: true }, { name: "tokenId", type: "uint256", indexed: true }, { name: "amount", type: "uint256", indexed: false }] },
] as const;

export const governorAbi = [
  { type: "function", name: "state", stateMutability: "view", inputs: [{ name: "proposalId", type: "uint256" }], outputs: [{ type: "uint8" }] },
  { type: "function", name: "proposalDeadline", stateMutability: "view", inputs: [{ name: "proposalId", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "proposalVotes", stateMutability: "view", inputs: [{ name: "proposalId", type: "uint256" }], outputs: [{ name: "againstVotes", type: "uint256" }, { name: "forVotes", type: "uint256" }, { name: "abstainVotes", type: "uint256" }] },
  { type: "function", name: "execute", stateMutability: "payable", inputs: [{ name: "targets", type: "address[]" }, { name: "values", type: "uint256[]" }, { name: "calldatas", type: "bytes[]" }, { name: "descriptionHash", type: "bytes32" }], outputs: [{ type: "uint256" }] },
] as const;

/** Governor states, indexed by the value `state(proposalId)` returns. */
export const PROPOSAL_STATES = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"] as const;
