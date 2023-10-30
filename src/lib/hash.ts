import Hash from "ipfs-only-hash";
export async function hashV1(content: Buffer): Promise<string> {
  return Hash.of(content, { cidVersion: 1 });
}
