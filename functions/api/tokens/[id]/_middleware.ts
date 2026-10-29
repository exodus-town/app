import { recoverMessageAddress } from "viem";
import { SIGNED_MESSAGE_HEADER, SIGN_MESSAGE } from "../../../lib/auth";
import { error } from "../../../lib/response";
import { Env } from "../../../lib/env";
import { getOwner } from "../../../lib/owners";

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

  // The owner of record keeps editing rights after returning the plot to the DAO.
  const { owner } = await getOwner(context.env, tokenId);

  if (owner !== address) {
    return error(`Unauthorized: owner=${owner} and address=${address}`, 401);
  }

  return context.next();
};

export const onRequestDelete = onRequestPost;
