import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useGetOwnersQuery } from "./api";
import { toCoords } from "../lib/coords";

/** Every plot's owner of record, and the plots the connected account owns. */
export const useTown = () => {
  const { address } = useAccount();
  const { data: owners = [], refetch, isLoading } = useGetOwnersQuery(undefined, {
    pollingInterval: 60_000,
  });

  const tokenIds = useMemo(
    () =>
      address
        ? owners.flatMap(({ owner }, id) =>
            owner.toLowerCase() === address.toLowerCase() ? [String(id)] : []
          )
        : [],
    [owners, address]
  );

  const ownedCoords = useMemo(
    () =>
      new Set(
        tokenIds.map((tokenId) => {
          const [x, y] = toCoords(tokenId);
          return `${x},${y}`;
        })
      ),
    [tokenIds]
  );

  return {
    owners,
    tokenIds,
    ownedCoords,
    isLoading,
    lastTokenId: owners.length - 1,
    reload: refetch,
  };
};
