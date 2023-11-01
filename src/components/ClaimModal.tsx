import { memo, useEffect } from "react"
import { useNavigate } from 'react-router'
import { Button, Modal, ModalNavigation, StarWalletIcon } from "decentraland-ui"
import { useAuth } from "../modules/auth"
import { toCoords } from "../lib/coords"
import './ClaimModal.css'

type Props = {
  tokenId: string | null
  onClose: () => void
}

export const ClaimModal = memo<Props>(({ tokenId, onClose }) => {

  const { signedMessage, isSigningMessage, signMessage, isSuccess } = useAuth()

  const navigate = useNavigate()

  useEffect(() => {
    if (isSuccess) {
      navigate(`/tokens/${tokenId}`)
    }
  }, [isSuccess, tokenId, navigate])

  if (!tokenId) return null

  return (
    <Modal open size="tiny" className="ClaimModal">
      <ModalNavigation title="Congratulations!" onClose={onClose} />
      <Modal.Description><StarWalletIcon /></Modal.Description>
      <Modal.Content>You are now the owner of the Parcel <div className="coords"><i className="pin" /> {toCoords(tokenId).join(',')}</div> {!signedMessage && <><br /><br />You can now sign in to Exodus Town to start editing it.</>}</Modal.Content>
      <Modal.Actions>
        <Button primary disabled={isSigningMessage} loading={isSigningMessage} onClick={() => signedMessage ? navigate(`/tokens/${tokenId}`) : signMessage()}>{signedMessage ? 'Continue' : 'Sign In'}</Button>
      </Modal.Actions>
    </Modal>
  )
})