import { memo, useCallback, useEffect, useMemo, useState } from "react";
import cx from "classnames";
import { MessageTransport } from "@dcl/mini-rpc";
import { CameraClient } from "@dcl/inspector";
import { Loader } from "decentraland-ui";
import { Inspector } from "./Inspector";
import "./Preview.css";

type Props = {
  tokenId?: string;
};

export const Preview = memo<Props>(({ tokenId }) => {
  const [screenshots, setScreenshots] = useState<Record<string, string>>({});
  const [isRendering, setIsRendering] = useState(true);

  const takeScreenshot = useCallback(
    async (iframe: HTMLIFrameElement) => {
      const transport = new MessageTransport(
        window,
        iframe.contentWindow!,
        "*"
      );
      const camera = new CameraClient(transport);
      const screenshot = await camera.takeScreenshot(1024, 812);
      setScreenshots({
        ...screenshots,
        [tokenId!]: screenshot,
      });
      setIsRendering(false);
      camera.dispose();
    },
    [tokenId, screenshots, setScreenshots]
  );

  const screenshot = useMemo(
    () => (tokenId && screenshots[tokenId]) || null,
    [tokenId, screenshots]
  );

  useEffect(() => {
    setIsRendering(true);
  }, [tokenId]);

  return (
    <>
      <div className={cx("Preview", { "is-rendering": isRendering })}>
        <div
          className="image"
          style={{
            filter: screenshot ? "" : "blur(1px)",
            backgroundImage: screenshot
              ? `url(${screenshot})`
              : `url(/api/tokens/${tokenId}/preview)`,
          }}
        ></div>
        {!screenshot && <Loader active size="small" />}
      </div>
      {isRendering && (
        <div className="generate-preview">
          <Inspector tokenId={tokenId} key={tokenId} onLoad={takeScreenshot} />
        </div>
      )}
    </>
  );
});
