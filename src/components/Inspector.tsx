import { memo, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import cx from 'classnames'
import { Loader } from "decentraland-ui";
import { init, unlock } from "../modules/inspector";
import { useToken } from "../modules/token";
import './Inspector.css'

export const Inspector = memo(() => {

  const iframeRef = useRef<HTMLIFrameElement | null>(null)

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

      setIsLocked(!isOwner)
      init(iframe, { tokenId, isOwner }).then(() => setIsReady(true))
    }
  }, [isLoading, isReady, tokenId, isOwner])

  useEffect(() => {
    if (isOwner && isLocked && isReady) {
      const iframe = iframeRef.current
      if (!iframe) return
      unlock(iframe)
    }
  }, [isOwner, isLocked, isReady])

  return <div className={cx('Inspector', {
    'is-loading': isLoading,
    'is-ready': isReady
  })}>
    {isLoading && <Loader active />}
    <iframe src={`${window.location.origin}/inspector.html?dataLayerRpcParentUrl=${window.location.origin}&binIndexJsUrl=${window.location.origin}/bin/index.js`} ref={iframeRef} />
  </div>
})