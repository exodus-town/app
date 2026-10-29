import { memo } from "react";
import { Link } from "react-router-dom";
import { formatEther, erc20Abi } from "viem";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useReadContract, useDisconnect } from "wagmi";
import { Container, Mana, Menu, UserMenu } from "decentraland-ui";
import { Network } from "@dcl/schemas";
import { useAvatar } from "../modules/avatar";
import { MANA_TOKEN_CONTRACT_ADDRESS } from "../eth";
import "./Navbar.css";
import { getPlayUrl } from "../lib/play";

const USER_MENU_I18N = {
  myAssets: "My Assets",
  account: "Account Settings",
  viewProfile: "View Profile",
  signIn: "Sign In",
  signOut: "Log Out",
  guest: "Guest",
  marketplaceAuthorizations: "Marketplace Authorizations",
  download: "Download",
};

export const Navbar = memo(() => {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { avatar } = useAvatar(address);

  const {
    data: mana,
    isLoading: isLoadingBalance,
  } = useReadContract({
    address: MANA_TOKEN_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address!],
  });

  const balance = mana ? +formatEther(mana) | 0 : 0;
  const prettyBalance = balance.toLocaleString();

  return (
    <div className="dcl navbar Navbar">
      <Container className="row">
        <Menu secondary className="dcl navbar-menu">
          <Link to="/" className="dcl navbar-logo">
            <div className="dcl logo"></div>
          </Link>
          <Menu.Item href={getPlayUrl()}>
            PLAY
          </Menu.Item>
          <Menu.Item href={"https://opensea.io/collection/exodus-town"}>
            MARKET
          </Menu.Item>
          <Menu.Item as={Link} to="/unwind">
            UNWIND
          </Menu.Item>
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
                  onClickSignOut={() => disconnect()}
                  i18n={USER_MENU_I18N}
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
