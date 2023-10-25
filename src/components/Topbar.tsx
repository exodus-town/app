import { memo, useMemo } from "react"
import { useParams } from "react-router"
import { Link } from "react-router-dom"
import { MdOutlineArrowBackIosNew as Back } from 'react-icons/md'
import { Button } from "decentraland-ui"
import { useAccount } from "wagmi"
import { toCoords } from "../lib/coords"
import { useToken } from "../modules/token"
import './Topbar.css'
import { useLogin } from "../modules/login"

export const Topbar = memo(() => {
  const { tokenId } = useParams()
  const { isOwner } = useToken(tokenId)
  const { isConnected } = useAccount()
  const { login, isLoggingIn } = useLogin()

  const [x, y] = useMemo(() => {
    return tokenId ? toCoords(tokenId) : [0, 0] as const
  }, [tokenId])

  return <div className="Topbar">
    <div className="title"><Link to="/"><Back className="back" /> Parcel {x},{y}</Link></div>
    <div className="actions">
      {isConnected ? <><Button secondary size="small">Preview</Button>{isOwner ? <Button primary size="small">Publish</Button> : null}</> : <Button primary size="small" onClick={login} disabled={isLoggingIn} loading={isLoggingIn}>Sign In</Button>}
    </div>
  </div>
})