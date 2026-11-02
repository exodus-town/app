import { memo, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { Button, Loader, Mana } from "decentraland-ui";
import { Link } from "react-router-dom";
import { Network } from "@dcl/schemas";
import { BiSolidPencil } from "react-icons/bi";
import { PiCaretCircleLeft, PiCaretCircleRight } from "react-icons/pi";
import { AUCTION_HOUSE_CONTRACT_ADDRESS } from "../eth";
import { toCoords } from "../lib/coords";
import { toLayout } from "../lib/layout";
import { getPlayUrl } from "../lib/play";
import { useTown } from "../modules/town";
import { useSnapshot } from "../modules/snapshot";
import { Preview } from "./Preview";
import { User } from "./User";
import "./ParcelPanel.css";

type Props = {
  tokenId?: string;
  setTokenId: (tokenId: string) => void;
};

export const ParcelPanel = memo<Props>(({ tokenId, setTokenId }) => {
  const { address } = useAccount();
  const { owners, lastTokenId, isLoading } = useTown();
  const { amounts } = useSnapshot();

  const id = Number(tokenId);
  const isNextEnabled = id < lastTokenId;
  const isPrevEnabled = id > 0;
  const handleNext = useCallback(() => {
    if (isNextEnabled) setTokenId(String(id + 1));
  }, [setTokenId, id, isNextEnabled]);
  const handlePrev = useCallback(() => {
    if (isPrevEnabled) setTokenId(String(id - 1));
  }, [setTokenId, id, isPrevEnabled]);

  const record = tokenId ? owners[id] : undefined;
  const isUnsold =
    record?.owner.toLowerCase() === AUCTION_HOUSE_CONTRACT_ADDRESS.toLowerCase();
  const isOwner =
    !!address && record?.owner.toLowerCase() === address.toLowerCase();
  const amount = tokenId ? amounts.get(tokenId) : undefined;

  const base = useMemo(
    () => (tokenId ? toLayout(tokenId).base : { x: 0, y: 0 }),
    [tokenId]
  );

  return (
    <div className={`ParcelPanel ${isLoading ? "loading" : ""}`.trim()}>
      {isLoading || !record ? (
        <Loader active />
      ) : (
        <>
          <div className="header">
            <div className="controls">
              <PiCaretCircleLeft
                className={isPrevEnabled ? "enabled" : ""}
                onClick={handlePrev}
              />
            </div>
            <div className="parcel">
              Parcel{" "}
              {tokenId && (
                <div className="coords">
                  <i className="pin" />
                  {toCoords(tokenId).join(",")}
                </div>
              )}
            </div>
            <div className="controls">
              <PiCaretCircleRight
                className={isNextEnabled ? "enabled" : ""}
                onClick={handleNext}
              />
            </div>
          </div>

          <Preview tokenId={tokenId} />

          <div className="row info owner-info">
            <div className="column owner">
              <div className="label">
                {isUnsold ? "Never sold" : record.returned ? "Owner · returned" : "Owner"}
              </div>
              <div className="value">
                {isUnsold ? "—" : <User address={record.owner} />}
              </div>
              {amount !== undefined ? (
                <div className="sold">
                  Sold for <Mana network={Network.MATIC} inline />
                  {Number(formatEther(amount)).toLocaleString()}
                </div>
              ) : null}
            </div>
            <div className="buttons">
              {isOwner ? (
                <Button as={Link} primary className="action-button" to={`/tokens/${tokenId}`}>
                  Edit <BiSolidPencil />
                </Button>
              ) : (
                <Button primary className="action-button" href={getPlayUrl(base)}>
                  Jump In <i className="jump-in-icon" />
                </Button>
              )}
              {isOwner && !record.returned && amount !== undefined ? (
                <Button as={Link} basic className="action-button" to="/unwind">
                  Unwind
                </Button>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
});
