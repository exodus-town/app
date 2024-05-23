import { recoverMessageAddress } from "viem";
import { SIGNED_MESSAGE_HEADER, SIGN_MESSAGE } from "../../../lib/auth";
import { error } from "../../../lib/response";
import { Env } from "../../../lib/env";
import { getClient } from "../../../lib/contracts";
import { townTokenABI } from "@exodus.town/contracts";

export const onRequestPost: PagesFunction<Env, "id"> = async (context) => {
  const tokenId = context.params.id;
  if (!tokenId || Array.isArray(tokenId)) {
    return error(`Invalid tokenId=${tokenId}`, 400);
  }
  const signedMessage = context.request.headers.get(SIGNED_MESSAGE_HEADER);
  if (!signedMessage) {
    return error(`Unauthorized: missing ${SIGNED_MESSAGE_HEADER}`, 401);
  }
  const address = await recoverMessageAddress({
    message: SIGN_MESSAGE,
    signature: signedMessage as `0x${string}`,
  });

  const client = getClient(context.env);
  const owner = await client.readContract({
    abi: townTokenABI,
    address: context.env.TOWN_TOKEN_CONTRACT_ADDRESS,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
  });

  if (owner !== address) {
    return error(`Unauthorized: owner=${owner} and address=${address}`, 401);
  }

  return context.next();
};

export const onRequestDelete = onRequestPost;
