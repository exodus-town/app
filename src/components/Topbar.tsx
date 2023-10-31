import { memo, useMemo } from "react"
import { useParams } from "react-router"
import { Link } from "react-router-dom"
import { MdOutlineArrowBackIosNew as Back } from 'react-icons/md'
import { useAccount } from "wagmi"
import { Button } from "decentraland-ui"
import { toCoords } from "../lib/coords"
import { useLogin } from "../modules/login"
import { useToken } from "../modules/token"
import './Topbar.css'

type Props = {
  hasSignedMessage: boolean
  isSigningMessage: boolean
  onSignMessage: () => void
}

export const Topbar = memo<Props>(({
  hasSignedMessage,
  isSigningMessage,
  onSignMessage,
}) => {
  const { tokenId } = useParams()
  const { isConnected } = useAccount()
  const { login, isLoggingIn } = useLogin()
  const { isOwner } = useToken(tokenId)

  const [x, y] = useMemo(() => {
    return tokenId ? toCoords(tokenId) : [0, 0] as const
  }, [tokenId])

  return <div className="Topbar">
    <div className="title"><Link to="/"><Back className="back" /> Parcel {x},{y}</Link></div>
    <div className="actions">
      {isConnected
        ? !isOwner || hasSignedMessage
          ? <Button href={`https://play.decentraland.org?realm=exodus.town/${tokenId}`} primary size="small" target="_blank" className="jump-in">Jump In <i className="jump-in-icon" /></Button>
          : <Button primary size="small" onClick={() => onSignMessage()} disabled={isSigningMessage} loading={isSigningMessage}>Sign In</Button>
        : <Button primary size="small" onClick={login} disabled={isLoggingIn} loading={isLoggingIn}>Sign In</Button>

      }
    </div>
  </div>
})