import { memo, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import cx from 'classnames'
import { Loader } from "decentraland-ui";
import { init, unlock } from "../modules/inspector";
import { useToken } from "../modules/token";
import './Inspector.css'

type Props = {
  signedMessage: string | null
}

export const Inspector = memo<Props>(({ signedMessage }) => {

  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const disposeRef = useRef<(() => void) | null>(null)

  const { tokenId } = useParams()
  const { isOwner } = useToken(tokenId)

  const [isLoading, setIsLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.onload = () => setIsLoading(false)
    }
  })

  useEffect(() => {
    if (tokenId && !isLoading && !isReady) {
      const iframe = iframeRef.current
      if (!iframe) return

      setIsLocked(!signedMessage)
      init(iframe, { tokenId, isOwner, signedMessage }).then((dispose) => {
        setIsReady(true)
        disposeRef.current = dispose
      })
    }
  }, [isLoading, isReady, tokenId, isOwner, signedMessage])

  useEffect(() => {
    if (isOwner && isLocked && isReady && signedMessage) {
      const iframe = iframeRef.current
      if (!iframe) return
      unlock(iframe, signedMessage)
    }
  }, [isOwner, isLocked, isReady, signedMessage])

  useEffect(() => {
    return () => {
      if (disposeRef.current) {
        console.log('DISPOSING!!')
        disposeRef.current()
      }
    }
  }, [])

  return <div className={cx('Inspector', {
    'is-loading': isLoading,
    'is-ready': isReady
  })}>
    {isLoading && <Loader active />}
    <iframe src={`${window.location.origin}/inspector.html?dataLayerRpcParentUrl=${window.location.origin}&binIndexJsUrl=${window.location.origin}/bin/index.js`} ref={iframeRef} />
  </div>
})