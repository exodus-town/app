import { Avatar } from "@dcl/schemas";
import { useEffect, useState } from "react";

export const useAvatar = (address?: string) => {
  const [avatar, setAvatar] = useState<Avatar>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    setIsLoading(true);
    if (address) {
      fetch(`https://peer.decentraland.org/lambdas/profiles`, {
        method: "post",
        body: JSON.stringify({ ids: [address] }),
      })
        .then((resp) => resp.json())
        .then((results) => {
          setAvatar(results[0].avatars[0]);
        })
        .catch((error) => {
          setError(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [address]);

  return { avatar, isLoading, error };
};
