import { memo } from "react"
import { useParams } from "react-router"
import { Topbar } from "../components/Topbar"
import { Inspector } from "../components/Inspector"
import { useToken } from "../modules/token"
import './TokenPage.css'
import { useAuth } from "../modules/auth"

export const TokenPage = memo(() => {
  const { tokenId } = useParams()
  const { isOwner } = useToken(tokenId)
  const { signedMessage, isSigningMessage, signMessage } = useAuth()

  return (
    <div className="TokenPage">
      <Topbar hasSignedMessage={!!signedMessage} isSigningMessage={isSigningMessage} onSignMessage={signMessage} />
      <Inspector tokenId={tokenId} isOwner={isOwner} signedMessage={signedMessage} />
    </div>
  )
})