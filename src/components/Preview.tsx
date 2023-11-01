import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { MessageTransport } from "@dcl/mini-rpc";
import { CameraClient } from "@dcl/inspector";
import { Loader } from "decentraland-ui";
import { Inspector } from "./Inspector";
import './Preview.css'

type Props = {
  tokenId?: string
}
export const Preview = memo<Props>(({ tokenId }) => {

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
    console.log('image generated!')
  }, [tokenId, screenshots, setScreenshots])

  const screenshot = useMemo(() => tokenId && screenshots[tokenId] || null, [tokenId, screenshots])

  useEffect(() => {
    setShouldGenerate(true)
  }, [tokenId])

  return (
    <div className="Preview" style={screenshot ? { backgroundImage: `url(${screenshot})` } : {}}>
      {!screenshot && <Loader active size="small" />}
      {shouldGenerate && <div className="generate-preview"><Inspector tokenId={tokenId} key={tokenId} onLoad={takeScreenshot} /></div>}
    </div>
  )
})