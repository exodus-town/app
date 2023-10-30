import { memo, useMemo } from "react"
import { useParams } from "react-router"
import { Link } from "react-router-dom"
import { MdOutlineArrowBackIosNew as Back } from 'react-icons/md'
import { Button } from "decentraland-ui"
import { useAccount } from "wagmi"
import { toCoords } from "../lib/coords"
import { toLayout } from "../lib/layout"
import { useLogin } from "../modules/login"
import './Topbar.css'

export const Topbar = memo(() => {
  const { tokenId } = useParams()
  const { isConnected } = useAccount()
  const { login, isLoggingIn } = useLogin()

  const [x, y] = useMemo(() => {
    return tokenId ? toCoords(tokenId) : [0, 0] as const
  }, [tokenId])

  const { base } = useMemo(() => {
    return tokenId ? toLayout(tokenId) : { base: { x: 0, y: 0 } }
  }, [tokenId])

  return <div className="Topbar">
    <div className="title"><Link to="/"><Back className="back" /> Parcel {x},{y}</Link></div>
    <div className="actions">
      {isConnected ? <Button href={`https://play.decentraland.org?realm=exodus.town&position=${base.x},${base.y}`} primary size="small" target="_blank">Jump In</Button> : <Button primary size="small" onClick={login} disabled={isLoggingIn} loading={isLoggingIn}>Sign In</Button>}
    </div>
  </div>
})