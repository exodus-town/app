import Hash from "ipfs-only-hash";
export async function hashV1(content: Buffer) {
  return Hash.of(content, { cidVersion: 1 });
}
