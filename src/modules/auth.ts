import { useEffect, useMemo, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { LOCAL_STORAGE_KEY, SIGN_MESSAGE } from "../lib/auth";

export const useAuth = () => {
  const { address } = useAccount();
  const storedSignedMessages = useMemo(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as Record<string, string>;
      } catch (error) {
        // ignore
      }
    }
    return {};
  }, []);
  const storedSignedMessage = useMemo(() => {
    if (address) {
      return storedSignedMessages[address];
    }
  }, [address, storedSignedMessages]);
  const [signedMessage, setSignedMessage] = useState(storedSignedMessage);
  const {
    data,
    isLoading: isSigningMessage,
    signMessage,
    isSuccess,
  } = useSignMessage({
    message: SIGN_MESSAGE,
  });
  useEffect(() => {
    if (address && data) {
      const newStoredSignedMessages = {
        ...storedSignedMessages,
        [address]: data,
      };
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(newStoredSignedMessages)
      );
      setSignedMessage(data);
    }
  }, [data, address, storedSignedMessages]);

  return {
    signedMessage,
    isSigningMessage,
    signMessage,
    isSuccess,
  };
};
