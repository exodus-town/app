import { memo, useEffect, useState } from "react"
import { useParams } from "react-router"
import { useSignMessage } from "wagmi"
import { Topbar } from "../components/Topbar"
import { Inspector } from "../components/Inspector"
import { useToken } from "../modules/token"
import { LOCAL_STORAGE_KEY, SIGN_MESSAGE } from "../lib/auth"
import './TokenPage.css'

export const TokenPage = memo(() => {
  const { tokenId } = useParams()
  const { isOwner } = useToken(tokenId)
  const [signedMessage, setSignedMessage] = useState(localStorage.getItem(LOCAL_STORAGE_KEY))
  const { data, isLoading, signMessage } = useSignMessage({
    message: SIGN_MESSAGE
  })
  useEffect(() => {
    if (data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, data)
      setSignedMessage(data)
    }
  }, [data])


  return (
    <div className="TokenPage">
      <Topbar hasSignedMessage={!!signedMessage} isSigningMessage={isLoading} onSignMessage={signMessage} />
      <Inspector tokenId={tokenId} isOwner={isOwner} signedMessage={signedMessage} />
    </div>
  )
})