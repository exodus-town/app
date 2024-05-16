import { memo, useCallback, useEffect, useRef, useState } from "react";
import cx from "classnames";
import { MessageTransport } from "@dcl/mini-rpc";
import { CameraClient, UiClient } from "@dcl/inspector";
import { Loader } from "decentraland-ui";
import { Inspector } from "./Inspector";
import "./Preview.css";

type Props = {
  tokenId?: string;
};

export const Preview = memo<Props>(({ tokenId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const cameraRef = useRef<CameraClient | null>(null);

  const handleOnReady = useCallback(
    async (iframe: HTMLIFrameElement) => {
      setIsLoading(false);
      const transport = new MessageTransport(
        window,
        iframe.contentWindow!,
        "*"
      );
      const ui = new UiClient(transport);
      await Promise.all([
        ui.toggleGroundGrid(false),
        ui.togglePanel("shortcuts", false),
      ]);
      cameraRef.current = new CameraClient(transport);
    },
    [setIsLoading]
  );

  // spin
  useEffect(() => {
    let i = 0; // current angle
    const s = 0.5; // speed
    const r = 48; // radius
    const y = 24; // height
    const cx = 24; // center x
    const cz = 24; // center z
    const interval = setInterval(async () => {
      const x = Math.sin(i) * r + cx;
      const z = Math.cos(i) * r + cz;
      i += (Math.PI / 180) * s;
      if (cameraRef.current) {
        const camera = cameraRef.current;
        await Promise.all([
          camera.setPosition(x, y, z),
          camera.setTarget(cx, 0, cz),
        ]);
      }
    }, 32);
    return () => clearInterval(interval);
  }, [tokenId]);

  return (
    <div className={cx("Preview", { "is-loading": isLoading })}>
      <Inspector tokenId={tokenId} key={tokenId} onReady={handleOnReady} />
      {isLoading && <Loader active />}
    </div>
  );
});
