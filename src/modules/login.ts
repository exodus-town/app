import { useWeb3Modal } from "@web3modal/react";
import { useCallback, useEffect, useState } from "react";
import { getChain } from "../eth";

export const useLogin = () => {
  const { open, isOpen, setDefaultChain } = useWeb3Modal();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    setDefaultChain(getChain());
  }, [setDefaultChain]);

  const login = useCallback(() => {
    setIsLoggingIn(true);
    open();
  }, [open]);

  useEffect(() => {
    if (!isOpen) {
      setIsLoggingIn(false);
    }
  }, [isOpen, setIsLoggingIn]);

  return {
    login,
    isLoggingIn,
  };
};
