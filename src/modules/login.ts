import { useWeb3Modal } from "@web3modal/react";
import { useEffect } from "react";
import { getChain } from "../eth";

export const useLogin = () => {
  const { open, isOpen, setDefaultChain } = useWeb3Modal();

  useEffect(() => {
    setDefaultChain(getChain());
  }, [setDefaultChain]);

  return {
    login: open,
    isLoggingIn: isOpen,
  };
};
