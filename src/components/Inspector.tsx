import { memo, useEffect, useRef, useState } from "react";
import cx from 'classnames'
import { Loader } from "decentraland-ui";
import { init, unlock } from "../modules/inspector";
import './Inspector.css'

type Props = {
  tokenId?: string
  isOwner?: boolean
  signedMessage?: string | null
  onLoad?: (iframe: HTMLIFrameElement) => void
}

export const Inspector = memo<Props>(({ tokenId, isOwner, signedMessage, onLoad }) => {

  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const disposeRef = useRef<(() => void) | null>(null) 

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
      init(iframe, { tokenId, isOwner, signedMessage, onLoad: onLoad && (() => onLoad(iframe)) }).then((dispose) => {
        setIsReady(true)
        disposeRef.current = dispose
      })
    }
  }, [isLoading, isReady, tokenId, isOwner, signedMessage, onLoad])

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