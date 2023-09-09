import { memo } from "react";
import { formatEther } from "viem";
import { erc20ABI, useAccount, useContractRead, useDisconnect } from "wagmi";
import { Container, Menu, UserMenu } from "decentraland-ui";
import { Network } from "@dcl/schemas";
import { MANA_TOKEN_CONTRACT_ADDRESS } from "../eth";
import { useAvatar } from "../modules/avatar";
import { config } from "../config";
import './Navbar.css'
import { useLogin } from "../modules/login";

export const Navbar = memo(() => {
  const { address, isConnected } = useAccount()
  const { login, isLoggingIn } = useLogin()
  const { disconnect } = useDisconnect()
  const { avatar } = useAvatar(address)

  const { data: mana, isLoading } = useContractRead({
    address: MANA_TOKEN_CONTRACT_ADDRESS,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [address!]
  })

  return (
    <div className="dcl navbar Navbar">
      <Container>
        <Menu stackable secondary>
          <div className="dcl navbar-logo">
            <div className="dcl logo"></div>
          </div>
          <Menu.Item href="https://play.decentraland.org?realm=exodus.town" target="_blank">Play</Menu.Item>
          <Menu.Item href={config.get('DAO_URL')} target="_blank">DAO</Menu.Item>
          <Menu.Item href={config.get('TREASURY_URL') + config.get('EXODUS_DAO_CONTRACT_ADDRESS')} target="_blank">Treasury</Menu.Item>
        </Menu>
        <div className="dcl navbar-account">
          <div className="dcl column right">
            <Menu secondary className="dcl navbar-account-menu">
              {isConnected ? <UserMenu manaBalances={isLoading ? undefined : { [Network.MATIC]: +formatEther(mana!) }} address={address} avatar={avatar} onSignOut={disconnect} isSignedIn /> : <Menu.Item disabled={isLoggingIn} onClick={login}>Sign In</Menu.Item>}
            </Menu>
          </div>
        </div>
      </Container>
    </div>
  )
})