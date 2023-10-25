import { useTown } from "./town";
import { useMemo } from "react";

export const useToken = (tokenId?: string) => {
  const { tokenIds } = useTown();
  const isOwner = useMemo(() => {
    return !!tokenId && tokenIds.includes(tokenId);
  }, [tokenId, tokenIds]);
  return { isOwner };
};
