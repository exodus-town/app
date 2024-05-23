import { memo, useMemo, useState } from "react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { MdOutlineArrowBackIosNew as Back } from "react-icons/md";
import { FaTerminal as TerminalIcon } from "react-icons/fa";
import { useAccount } from "wagmi";
import { Button } from "decentraland-ui";
import { toCoords } from "../lib/coords";
import { CliModal } from "./CliModal";
import { toLayout } from "../lib/layout";
import { useToken } from "../modules/token";
import "./Topbar.css";

type Props = {
  hasSignedMessage: boolean;
  isSigningMessage: boolean;
  onSignMessage: () => void;
};

export const Topbar = memo<Props>(
  ({ hasSignedMessage, isSigningMessage, onSignMessage }) => {
    const { tokenId } = useParams();
    const { isConnected } = useAccount();
    const { open } = useWeb3Modal();
    const { isOwner } = useToken(tokenId);
    const [showCliModal, setShowCliModal] = useState(false);

    const [x, y] = useMemo(() => {
      return tokenId ? toCoords(tokenId) : ([0, 0] as const);
    }, [tokenId]);

    const base = useMemo(
      () => (tokenId ? toLayout(tokenId).base : { x: 0, y: 0 }),
      [tokenId]
    );

    return (
      <div className="Topbar">
        <div className="title">
          <Link to="/">
            <Back className="back" /> Parcel {x},{y}
          </Link>
        </div>
        <div className="actions">
          {isConnected ? (
            !isOwner || hasSignedMessage ? (
              <>
                {hasSignedMessage ? (
                  <Button
                    onClick={() => setShowCliModal(true)}
                    secondary
                    size="small"
                    className="cli"
                  >
                    <TerminalIcon />
                  </Button>
                ) : null}
                <Button
                  href={`https://decentraland.org/play?realm=exodus.town&position=${base.x},${base.y}&skipSetup=true`}
                  primary
                  size="small"
                  target="_blank"
                  className="jump-in"
                >
                  Jump In <i className="jump-in-icon" />
                </Button>
              </>
            ) : (
              <Button
                primary
                size="small"
                onClick={() => onSignMessage()}
                disabled={isSigningMessage}
                loading={isSigningMessage}
              >
                Sign In
              </Button>
            )
          ) : (
            <Button primary size="small" onClick={() => open()}>
              Sign In
            </Button>
          )}
        </div>
        {tokenId && showCliModal && (
          <CliModal tokenId={tokenId} onClose={() => setShowCliModal(false)} />
        )}
      </div>
    );
  }
);
