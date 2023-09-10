import { memo } from "react";
import { formatEther } from "viem";
import { erc20ABI, useAccount, useContractRead, useDisconnect } from "wagmi";
import { Container, Mana, Menu, UserMenu } from "decentraland-ui";
import { Network } from "@dcl/schemas";
import { useAvatar } from "../modules/avatar";
import { useLogin } from "../modules/login";
import { MANA_TOKEN_CONTRACT_ADDRESS } from "../eth";
import { config } from "../config";
import './Navbar.css'

export const Navbar = memo(() => {
  const { address, isConnected } = useAccount()
  const { login, isLoggingIn } = useLogin()
  const { disconnect } = useDisconnect()
  const { avatar } = useAvatar(address)

  const { data: mana, isLoading: isLoadingBalance } = useContractRead({
    address: MANA_TOKEN_CONTRACT_ADDRESS,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [address!]
  })

  return (
    <div className="dcl navbar Navbar">
      <Container className="row">
        <Menu secondary className="dcl navbar-menu">
          <div className="dcl navbar-logo">
            <div className="dcl logo"></div>
          </div>
          <Menu.Item href="https://play.decentraland.org?realm=exodus.town" target="_blank">Play</Menu.Item>
          <Menu.Item href={config.get('DAO_URL')} target="_blank">DAO</Menu.Item>
          <Menu.Item href={config.get('TREASURY_URL') + config.get('EXODUS_DAO_CONTRACT_ADDRESS')} target="_blank">Treasury</Menu.Item>
        </Menu>
        <div className="dcl navbar-account">
            <Menu secondary className="dcl navbar-account-menu">
            {isConnected
              ?
              <>
                {isLoadingBalance ? null : <Mana inline network={Network.MATIC}>{+formatEther(mana!) | 0}</Mana>}
                <UserMenu address={address} avatar={avatar} onSignOut={disconnect} isSignedIn />
              </>
              : <Menu.Item disabled={isLoggingIn} onClick={login}>Sign In</Menu.Item>
            }
          </Menu>
        </div>
      </Container>
    </div>
  )
})