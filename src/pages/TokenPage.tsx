import { memo, useMemo } from "react"
import { useParams } from "react-router"
import { useTown } from "../modules/town"
import './TokenPage.css'

export const TokenPage = memo(() => {
  const { tokenId } = useParams()
  const { tokenIds } = useTown()
  const isOwner = useMemo(() => {
    return tokenId && tokenIds.includes(tokenId)
  }, [tokenId, tokenIds])
  return <div className="TokenPage">Token Page {tokenId} {isOwner ? 'is owner' : 'is not owner'}</div>
})