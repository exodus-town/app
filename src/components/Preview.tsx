import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { MessageTransport } from "@dcl/mini-rpc";
import { CameraClient } from "@dcl/inspector";
import { Loader } from "decentraland-ui";
import { getImage } from "../lib/image";
import { Inspector } from "./Inspector";
import './Preview.css'

type Props = {
  tokenId?: string
}


export const Preview = memo<Props>(({ tokenId }) => {
  const [image, setImage] = useState<string>('')
  const [screenshots, setScreenshots] = useState<Record<string, string>>({})
  const [shouldGenerate, setShouldGenerate] = useState(true)

  const takeScreenshot = useCallback(async (iframe: HTMLIFrameElement) => {
    const transport = new MessageTransport(window, iframe.contentWindow!, "*");
    const camera = new CameraClient(transport)
    const screenshot = await camera.takeScreenshot(1024, 812)
    setScreenshots({
      ...screenshots,
      [tokenId!]: screenshot
    })
    setShouldGenerate(false)
    camera.dispose()
  }, [tokenId, screenshots, setScreenshots])

  const screenshot = useMemo(() => tokenId && screenshots[tokenId] || null, [tokenId, screenshots])

  useEffect(() => {
    setShouldGenerate(true)
  }, [tokenId])

  useEffect(() => {
    if (tokenId) {
      getImage(tokenId).then(result => {
        if (result) {
          setImage(result)
        }
      })
    }
  }, [tokenId])

  useEffect(() => {
    if (tokenId && image && !(tokenId in screenshots)) {
      setScreenshots({
        ...screenshots,
        [tokenId]: image
      })
    }
  }, [image, screenshots, tokenId, setScreenshots])

  return (
    <>
      <div className="Preview" style={screenshot ? { backgroundImage: `url(${screenshot})` } : {}}>
        {(!screenshot) && <Loader active size="small" />}
      </div>
      {shouldGenerate && <div className="generate-preview"><Inspector tokenId={tokenId} key={tokenId} onLoad={takeScreenshot} /></div>}
    </>
  )
})