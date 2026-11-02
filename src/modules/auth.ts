import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { LOCAL_STORAGE_KEY } from "../lib/auth";

function readStored(): Record<string, string> {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Record<string, string>;
    } catch {
      // ignore
    }
  }
  return {};
}

/** The connected wallet's signed sign-in message, which the backend checks for every upload. */
export const useAuth = () => {
  const { address } = useAccount();
  // Kept in state so a new signature re-renders; read per address, since the wallet reconnects
  // after the first render.
  const [stored, setStored] = useState(readStored);
  const {
    data,
    isPending: isSigningMessage,
    signMessage,
    isSuccess,
  } = useSignMessage();

  useEffect(() => {
    if (address && data && stored[address] !== data) {
      const next = { ...readStored(), [address]: data };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      setStored(next);
    }
  }, [data, address, stored]);

  return {
    signedMessage: address ? stored[address] : undefined,
    isSigningMessage,
    signMessage,
    isSuccess,
  };
};
