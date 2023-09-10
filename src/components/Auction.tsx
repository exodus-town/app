import { memo, useCallback, useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { erc20ABI, erc721ABI, useAccount, useContractRead, useContractWrite, useNetwork, useSwitchNetwork, useWaitForTransaction } from "wagmi";
import { formatDistanceToNow } from 'date-fns'
import { Button, Loader, Mana } from "decentraland-ui";
import { auctionHouseABI } from "@exodus.town/contracts";
import { Network } from "@dcl/schemas";
import { FaUnlock } from 'react-icons/fa'
import { PiCaretCircleLeft, PiCaretCircleRight } from 'react-icons/pi'
import { AUCTION_HOUSE_CONTRACT_ADDRESS, MANA_TOKEN_CONTRACT_ADDRESS, TOWN_TOKEN_CONTRACT_ADDRESS, getChain } from "../eth";
import { toCoords } from "../lib/coords";
import { useLogin } from "../modules/login";
import { useAuction } from "../modules/auction";
import './Auction.css'

type Props = {
  tokenId?: string
  setTokenId: (tokenId: string) => void
}

export const Auction = memo<Props>(({ tokenId, setTokenId }) => {

  const { auction, isLoading, refetch, isWinner, isSettled, maxTokenId } = useAuction()
  const { address, isConnected } = useAccount()
  const [bidAmount, setBidAmount] = useState('')
  const [shouldApprove, setShouldApprove] = useState(false)
  const [bidError, setBidError] = useState<Error>()
  const { login, isLoggingIn } = useLogin()
  const { chain } = useNetwork()
  const { switchNetwork, isLoading: isSwitchingNetwork, error: switchNetworkError } = useSwitchNetwork({ chainId: getChain().id })

  const { data: mana } = useContractRead({
    address: MANA_TOKEN_CONTRACT_ADDRESS,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [address!]
  })

  const { data: allowance, isLoading: isLoadingAllowance } = useContractRead({
    address: MANA_TOKEN_CONTRACT_ADDRESS,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address!, AUCTION_HOUSE_CONTRACT_ADDRESS]
  })

  const isApproved = !!allowance && parseInt(formatUnits(allowance, 18)) > 0


  const { write: approve, status: approveStatus, data: approveData, error: approveError } = useContractWrite({
    address: MANA_TOKEN_CONTRACT_ADDRESS,
    abi: erc20ABI,
    functionName: 'approve',
    args: [AUCTION_HOUSE_CONTRACT_ADDRESS, parseUnits(bidAmount, 18)],
  })

  const { error: approveTxError, status: approveTxStatus } = useWaitForTransaction(approveData)

  const { write: createBid, status: createBidStatus, data: createBidData, error: createBidError } = useContractWrite({
    address: AUCTION_HOUSE_CONTRACT_ADDRESS,
    abi: auctionHouseABI,
    functionName: 'createBid',
    args: [BigInt(auction?.tokenId || 0), parseUnits(parseInt(bidAmount || '0').toString(), 18)],
  })

  const { error: createBidTxError, status: createBidTxStatus } = useWaitForTransaction(createBidData)

  const { write: settle, status: settleStatus, data: settleData, error: settleError } = useContractWrite({
    address: AUCTION_HOUSE_CONTRACT_ADDRESS,
    abi: auctionHouseABI,
    functionName: 'settleCurrentAndCreateNewAuction'
  })

  const { data: owner } = useContractRead({
    address: TOWN_TOKEN_CONTRACT_ADDRESS,
    abi: erc721ABI,
    functionName: 'ownerOf',
    args: [parseUnits(tokenId || '0', 0)]
  })

  const { error: settleTxError, status: settleTxStatus } = useWaitForTransaction(settleData)

  const isWrongNetwork = chain?.id !== getChain().id

  const error = switchNetworkError || approveError || approveTxError || createBidError || createBidTxError || settleError || settleTxError || bidError

  const handlePlaceBid = useCallback(() => {
    if (!auction || typeof mana === 'undefined') return
    if (bidAmount === '') {
      setBidError(void 0)
      return
    }
    const amount = Number(bidAmount)
    if (isNaN(amount)) return
    const manaBalance = Number(formatUnits(mana, 18))
    if (manaBalance < amount) {
      setBidError(new Error(`You don't have enough MANA`))
      return
    } else if (amount < auction.min) {
      setBidError(new Error(`Minimum bid amount is ${auction.min} MANA`))
      return
    } else if (!isApproved) {
      setBidError(void 0)
      setShouldApprove(true)
      return
    } else {
      setShouldApprove(false)
      setBidError(void 0)
      createBid()
    }
  }, [createBid, mana, auction, bidAmount, isApproved, setBidError])

  useEffect(() => {
    if (createBidTxStatus === 'success') {
      refetch()
    }
  }, [createBidTxStatus, refetch])

  useEffect(() => {
    if (settleTxStatus === 'success') {
      refetch()
    }
  }, [settleTxStatus, refetch])

  const isNextEnabled = Number(tokenId) < maxTokenId
  const isPrevEnabled = Number(tokenId) > 0

  const handleNext = useCallback(() => {
    if (!isNextEnabled) return
    const next = Number(tokenId) + 1
    setTokenId(next.toString())
  }, [setTokenId, tokenId, isNextEnabled])

  const handlePrev = useCallback(() => {
    if (!isPrevEnabled) return
    const prev = Number(tokenId) - 1
    setTokenId(prev.toString())
  }, [setTokenId, tokenId, isPrevEnabled])

  let showParcelOwner = false
  let parcelOwner = null
  if (Number(tokenId) < Number(auction?.tokenId)) {
    showParcelOwner = true
    parcelOwner = owner
  }
  if (tokenId === auction?.tokenId && isSettled && !isWinner) {
    showParcelOwner = true
    parcelOwner = auction!.bidder
  }

  return <div className="Auction">
    {isLoading
      ? <Loader active />
      : <>
        <div className="header">
          <div className="parcel">Parcel {tokenId && <div className="coords"><i className="pin" />{toCoords(tokenId).join(',')}</div>}</div>
          <div className="controls">
            <PiCaretCircleLeft className={isPrevEnabled ? 'enabled' : ''} onClick={handlePrev} />
            <PiCaretCircleRight className={isNextEnabled ? 'enabled' : ''} onClick={handleNext} />
          </div>
        </div>

        {showParcelOwner
          ? <div className="row info owner-info">
            <div className="column owner">
              <div className="label">Owner</div>
              <div className="value">{parcelOwner ? parcelOwner.slice(0, 6) : 'Loading...'}</div>
            </div>
            <Button primary className="jump-in" href={`https://play.decentraland.org?realm=exodus.town&position=${tokenId ? toCoords(tokenId).join(',') : '0,0'}`} target="_blank">Jump In <i className="jump-in-icon" /></Button>
          </div>
          : null
        }

        {!isNextEnabled
          ? <>
            <div className="row info">
              {isSettled
                ? isWinner
                  ? <div className="secondary-text">You are the winner of the auction!</div>
                  : <div className="secondary-text">The next auction is ready to start!</div>
                : <> 
                  <div className="column current-bid">
                    <div className="label">Current bid</div>
                    <div className="value"><Mana network={Network.MATIC} inline />{auction!.amount}</div>
                  </div>
                  <div className="column ends-in">
                    <div className="label">Ends in</div>
                    <div className="value">{formatDistanceToNow(auction!.endTime, { addSuffix: false })}</div>
                  </div>
                </>
              }
            </div>
            <div className="action">
              {!isConnected
                ? <Button className="login" primary onClick={login} disabled={isLoggingIn} loading={isLoggingIn}>Sign in</Button>
                : isWrongNetwork
                  ? <Button className="switch-network" primary onClick={() => switchNetwork ? switchNetwork() : void 0} disabled={isSwitchingNetwork}>Switch Network</Button>
                  : !isApproved && shouldApprove
                    ? <div className="approve-amount">
                      <Button className="cancel-approve" onClick={() => setShouldApprove(false)}>Back</Button>
                      <Button primary loading={isLoadingAllowance || approveTxStatus === 'loading'} disabled={isLoadingAllowance || approveStatus === 'loading' || approveTxStatus === 'loading'} className="approve" onClick={() => approve()}><FaUnlock />&nbsp;Unlock</Button>
                    </div>
                    : isSettled
                      ? <Button className="settle" primary loading={settleTxStatus === 'loading'} disabled={settleStatus === 'loading' || settleTxStatus === 'loading'} onClick={() => settle()}>{address === auction!.bidder ? 'Claim' : 'Start Auction'}</Button>
                      : <div className="place-bid">
                        <input value={bidAmount} placeholder={`${auction!.min} MANA`} className="bid-amount" onChange={e => setBidAmount(e.target.value)}></input>
                        <Button className="bid" primary loading={createBidTxStatus === 'loading'} disabled={createBidStatus === 'loading' || createBidTxStatus === 'loading' || (bidAmount !== '' && isNaN(Number(bidAmount)))} onClick={handlePlaceBid}>Place Bid</Button>
                      </div>
              }
            </div>
            {error && !error.message.toLowerCase().includes('user denied')
              ? <div className="error">
                {error.message}
              </div>
              : null
            }
          </>
          : null
        }
      </>
    }
  </div >
})