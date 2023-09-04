import { Container, Menu, UserMenu } from "decentraland-ui";
import { memo, useEffect } from "react";
import './Navbar.css'
import { erc20ABI, useAccount, useContractRead, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/react";
import { MANA_TOKEN_CONTRACT_ADDRESS, getChain } from "../eth";
import { useAvatar } from "../modules/avatar";
import { config } from "../config";
import { Network } from "@dcl/schemas";
import { formatEther } from "viem";

export const Navbar = memo(() => {
  const { address, isConnected } = useAccount()
  const { open, isOpen, setDefaultChain } = useWeb3Modal()
  const { disconnect } = useDisconnect()
  const { avatar } = useAvatar(address)

  useEffect(() => {
    setDefaultChain(getChain())
  }, [setDefaultChain])

  const { data: mana, isLoading } = useContractRead({
    address: MANA_TOKEN_CONTRACT_ADDRESS,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [address!]
  })

  console.log(mana)

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
              {isConnected ? <UserMenu manaBalances={isLoading ? undefined : { [Network.MATIC]: +formatEther(mana!) }} address={address} avatar={avatar} onSignOut={disconnect} isSignedIn /> : <Menu.Item disabled={isOpen} onClick={open}>Sign In</Menu.Item>}
            </Menu>
          </div>
        </div>
      </Container>
    </div>
  )
})