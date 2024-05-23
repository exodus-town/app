import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  formatUnits,
  hexToNumber,
  parseUnits,
  erc20Abi,
  erc721Abi,
} from "viem";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatDistanceToNow } from "date-fns";
import { Button, Loader, Mana } from "decentraland-ui";
import { Link } from "react-router-dom";
import { auctionHouseABI } from "@exodus.town/contracts";
import { Network } from "@dcl/schemas";
import { BiSolidPencil } from "react-icons/bi";
import { PiCaretCircleLeft, PiCaretCircleRight } from "react-icons/pi";
import {
  AUCTION_HOUSE_CONTRACT_ADDRESS,
  MANA_TOKEN_CONTRACT_ADDRESS,
  TOWN_TOKEN_CONTRACT_ADDRESS,
  getChain,
} from "../eth";
import { toCoords } from "../lib/coords";
import { toLayout } from "../lib/layout";
import { useTown } from "../modules/town";
import { useAuction } from "../modules/auction";
import { ClaimModal } from "./ClaimModal";
import { Preview } from "./Preview";
import { User } from "./User";
import "./Auction.css";

type Props = {
  tokenId?: string;
  setTokenId: (tokenId: string) => void;
};

export const Auction = memo<Props>(({ tokenId, setTokenId }) => {
  const {
    auction,
    isLoading,
    refetch: refetchAuction,
    isWinner,
    isSettled,
    hasBidder,
    maxTokenId,
  } = useAuction();
  const { address, isConnected, chain } = useAccount();
  const [bidAmount, setBidAmount] = useState("");
  const [shouldApprove, setShouldApprove] = useState(false);
  const [bidError, setBidError] = useState<Error>();
  const {
    switchChain,
    isIdle: isSwitchingChain,
    error: switchChainNetwork,
  } = useSwitchChain();
  const [won, setWon] = useState<string | null>(null);
  const { reload: reloadTown } = useTown();
  const { open } = useWeb3Modal();

  const { data: mana } = useReadContract({
    address: MANA_TOKEN_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address!],
  });

  const {
    data: allowance,
    isLoading: isLoadingAllowance,
    refetch: refechAllowance,
  } = useReadContract({
    address: MANA_TOKEN_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address!, AUCTION_HOUSE_CONTRACT_ADDRESS],
  });

  const parsedAllowance = useMemo(
    () => (allowance ? parseInt(formatUnits(allowance, 18)) : 0),
    [allowance]
  );
  const parsedBidAmount = useMemo(() => Number(bidAmount), [bidAmount]);
  const isApproved = useMemo(
    () => parsedAllowance > 0 && parsedAllowance >= parsedBidAmount,
    [parsedAllowance, parsedBidAmount]
  );

  const {
    writeContract: approve,
    status: approveStatus,
    error: approveError,
    data: approveHash,
  } = useWriteContract();

  const { status: approveTxStatus, error: approveTxError } =
    useWaitForTransactionReceipt({ hash: approveHash });

  const {
    writeContract: createBid,
    status: createBidStatus,
    error: createBidError,
    data: createBidHash,
  } = useWriteContract();

  const { status: createBidTxStatus, error: createBidTxError } =
    useWaitForTransactionReceipt({
      hash: createBidHash,
    });

  const {
    writeContract: settle,
    status: settleStatus,
    error: settleError,
    data: settleHash,
  } = useWriteContract();

  const { status: settleTxStatus, error: settleTxError } =
    useWaitForTransactionReceipt({
      hash: settleHash,
    });

  const ownerOf =
    Number(tokenId) <= Number(auction?.tokenId)
      ? parseUnits(tokenId || "0", 0)
      : undefined;
  const { data: owner } = useReadContract({
    address: TOWN_TOKEN_CONTRACT_ADDRESS,
    abi: erc721Abi,
    functionName: "ownerOf",
    args: [ownerOf!],
  });

  const isWrongNetwork = chain?.id !== getChain().id;

  const error =
    switchChainNetwork ||
    approveError ||
    createBidError ||
    settleError ||
    bidError ||
    approveTxError ||
    createBidTxError ||
    settleTxError;

  const handlePlaceBid = useCallback(() => {
    if (!auction || typeof mana === "undefined") return;
    if (bidAmount === "") {
      setBidError(void 0);
      return;
    }
    const amount = Number(bidAmount);
    if (isNaN(amount)) return;
    const manaBalance = Number(formatUnits(mana, 18));
    if (manaBalance < amount) {
      setBidError(new Error(`You don't have enough MANA`));
      return;
    } else if (amount < auction.min) {
      setBidError(new Error(`Minimum bid amount is ${auction.min} MANA`));
      return;
    } else if (!isApproved) {
      setBidError(void 0);
      setShouldApprove(true);
      return;
    } else {
      setShouldApprove(false);
      setBidError(void 0);
      createBid({
        address: AUCTION_HOUSE_CONTRACT_ADDRESS,
        abi: auctionHouseABI,
        functionName: "createBid",
        args: [
          BigInt(auction?.tokenId || 0),
          parseUnits(parseInt(bidAmount || "0").toString(), 18),
        ],
      });
    }
  }, [createBid, mana, auction, bidAmount, isApproved, setBidError]);

  useEffect(() => {
    if (createBidTxStatus === "success") {
      refetchAuction();
    }
  }, [createBidTxStatus, refetchAuction]);

  useEffect(() => {
    if (approveTxStatus === "success") {
      refechAllowance();
    }
  }, [approveTxStatus, refechAllowance]);

  useEffect(() => {
    if (settleTxStatus === "success") {
      if (isWinner && auction) {
        setWon(auction.tokenId);
      }
      refetchAuction();
      reloadTown();
    }
  }, [settleTxStatus, refetchAuction, isWinner, setWon, auction, reloadTown]);

  const isNextEnabled = Number(tokenId) < maxTokenId;
  const isPrevEnabled = Number(tokenId) > 0;

  const handleNext = useCallback(() => {
    if (!isNextEnabled) return;
    const next = Number(tokenId) + 1;
    setTokenId(next.toString());
  }, [setTokenId, tokenId, isNextEnabled]);

  const handlePrev = useCallback(() => {
    if (!isPrevEnabled) return;
    const prev = Number(tokenId) - 1;
    setTokenId(prev.toString());
  }, [setTokenId, tokenId, isPrevEnabled]);

  let showParcelOwner = false;
  let parcelOwner;
  if (Number(tokenId) < maxTokenId) {
    showParcelOwner = true;
    parcelOwner = owner;
  }
  if (tokenId === auction?.tokenId && isSettled && hasBidder && !isWinner) {
    showParcelOwner = true;
    parcelOwner = auction!.bidder;
  }

  const isEdit = parcelOwner === address;

  const auctionEndsIn = (
    <div className="info">
      Auction ends in{" "}
      <b>
        {formatDistanceToNow(auction?.endTime || Date.now(), {
          addSuffix: false,
        })}
      </b>
      .
    </div>
  );

  const base = useMemo(
    () => (tokenId ? toLayout(tokenId).base : { x: 0, y: 0 }),
    [tokenId]
  );

  return (
    <div className={`Auction ${isLoading ? "loading" : ""}`.trim()}>
      {isLoading ? (
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

          <ClaimModal tokenId={won} onClose={() => setWon(null)} />

          {showParcelOwner ? (
            <>
              <Preview tokenId={tokenId} />
              <div className="row info owner-info">
                <div className="column owner">
                  <div className="label">Owner</div>
                  <div className="value">{<User address={parcelOwner} />}</div>
                </div>
                {isEdit ? (
                  <Button
                    as={Link}
                    primary
                    className="action-button"
                    to={`/tokens/${tokenId}`}
                  >
                    Edit <BiSolidPencil />
                  </Button>
                ) : (
                  <Button
                    primary
                    className="action-button"
                    href={`https://decentraland.org/play?realm=exodus.town&position=${base.x},${base.y}&skipSetup=true`}
                  >
                    Jump In <i className="jump-in-icon" />
                  </Button>
                )}
              </div>
            </>
          ) : null}

          {!isNextEnabled ? (
            <>
              <div className="row info">
                {isSettled ? (
                  isWinner ? (
                    <div className="secondary-text">
                      You are the winner of the auction!
                    </div>
                  ) : (
                    <div className="secondary-text">
                      The next auction is ready to start!
                    </div>
                  )
                ) : (
                  <>
                    <div className="column left">
                      <div className="label">Current bid</div>
                      <div className="value">
                        <Mana network={Network.MATIC} inline />
                        {auction?.amount || 0}
                      </div>
                    </div>
                    {auction &&
                    hexToNumber(auction.bidder as unknown as `0x${string}`) !==
                      0 ? (
                      <div className="column right">
                        <div className="label">Placed by</div>
                        <div className="value">
                          {<User address={auction!.bidder} />}
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
              <div className="action">
                {!isConnected ? (
                  <>
                    {auctionEndsIn}
                    <Button className="login" primary onClick={() => open()}>
                      Sign in
                    </Button>
                  </>
                ) : isWrongNetwork ? (
                  <>
                    {auctionEndsIn}
                    <Button
                      className="switch-network"
                      primary
                      onClick={() =>
                        switchChain
                          ? switchChain({ chainId: getChain().id })
                          : void 0
                      }
                      disabled={isSwitchingChain}
                    >
                      Switch Network
                    </Button>
                  </>
                ) : !isApproved && shouldApprove ? (
                  <>
                    <div className="info">You only need to approve once.</div>
                    <div className="approve-amount">
                      <Button
                        className="cancel-approve"
                        onClick={() => setShouldApprove(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        primary
                        loading={
                          isLoadingAllowance ||
                          (approveHash && approveTxStatus === "pending")
                        }
                        disabled={
                          isLoadingAllowance ||
                          approveStatus === "pending" ||
                          (approveHash && approveTxStatus === "pending")
                        }
                        className="approve"
                        onClick={() =>
                          approve({
                            address: MANA_TOKEN_CONTRACT_ADDRESS,
                            abi: erc20Abi,
                            functionName: "approve",
                            args: [
                              AUCTION_HOUSE_CONTRACT_ADDRESS,
                              2n ** 256n - 1n,
                            ],
                          })
                        }
                      >
                        Approve
                      </Button>
                    </div>
                  </>
                ) : isSettled ? (
                  <Button
                    className="settle"
                    primary
                    loading={settleHash && settleTxStatus === "pending"}
                    disabled={
                      settleStatus === "pending" ||
                      (settleHash && settleTxStatus === "pending")
                    }
                    onClick={() =>
                      settle({
                        address: AUCTION_HOUSE_CONTRACT_ADDRESS,
                        abi: auctionHouseABI,
                        functionName: "settleCurrentAndCreateNewAuction",
                      })
                    }
                  >
                    {address === auction!.bidder ? "Claim" : "Start Auction"}
                  </Button>
                ) : (
                  <>
                    {auctionEndsIn}
                    <div className="place-bid">
                      <input
                        value={bidAmount}
                        placeholder={`${auction!.min} MANA`}
                        className="bid-amount"
                        onChange={(e) => setBidAmount(e.target.value)}
                      ></input>
                      <Button
                        className="bid"
                        primary
                        loading={
                          createBidHash && createBidTxStatus === "pending"
                        }
                        disabled={
                          createBidStatus === "pending" ||
                          (createBidHash && createBidTxStatus === "pending") ||
                          (bidAmount !== "" && isNaN(Number(bidAmount)))
                        }
                        onClick={handlePlaceBid}
                      >
                        Place Bid
                      </Button>
                    </div>
                  </>
                )}
              </div>
              {error &&
              !error.message.toLowerCase().includes("denied") &&
              !error.message.toLowerCase().includes("rejected") ? (
                <div className="error">{error.message}</div>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </div>
  );
});
