import { memo, useEffect } from "react";
import { formatEther, erc20Abi } from "viem";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useReadContract, useDisconnect } from "wagmi";
import { Container, Mana, Menu, UserMenu } from "decentraland-ui";
import { Network } from "@dcl/schemas";
import { useAvatar } from "../modules/avatar";
import { useAuction } from "../modules/auction";
import { MANA_TOKEN_CONTRACT_ADDRESS } from "../eth";
import { config } from "../config";
import "./Navbar.css";

export const Navbar = memo(() => {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const { avatar } = useAvatar(address);
  const { auction } = useAuction();

  const {
    data: mana,
    isLoading: isLoadingBalance,
    refetch,
  } = useReadContract({
    address: MANA_TOKEN_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address!],
  });

  const balance = mana ? +formatEther(mana) | 0 : 0;
  const prettyBalance = balance.toLocaleString();

  useEffect(() => {
    if (auction) {
      refetch();
    }
  }, [auction, refetch]);

  return (
    <div className="dcl navbar Navbar">
      <Container className="row">
        <Menu secondary className="dcl navbar-menu">
          <div className="dcl navbar-logo">
            <div className="dcl logo"></div>
          </div>
          <Menu.Item href="https://decentraland.org/play?realm=exodus.town">
            Play
          </Menu.Item>
          <Menu.Item href={"https://opensea.io/collection/exodus-town"}>
            MARKET
          </Menu.Item>
          <Menu.Item href={config.get("DAO_URL")}>DAO</Menu.Item>
          <Menu.Item href="https://x.com/ExodusTown">NEWS</Menu.Item>
        </Menu>
        <div className="dcl navbar-account">
          <Menu secondary className="dcl navbar-account-menu">
            {isConnected ? (
              <>
                {isLoadingBalance ? null : (
                  <Mana inline network={Network.MATIC}>
                    {prettyBalance}
                  </Mana>
                )}
                <UserMenu
                  address={address}
                  avatar={avatar}
                  onSignOut={disconnect}
                  isSignedIn
                />
              </>
            ) : (
              <Menu.Item onClick={() => open()}>Sign In</Menu.Item>
            )}
          </Menu>
        </div>
      </Container>
    </div>
  );
});
