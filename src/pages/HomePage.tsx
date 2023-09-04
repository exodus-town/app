import { memo, useCallback, useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { auctionHouseABI } from "@exodus.town/contracts";
import { erc20ABI, useAccount, useContractRead, useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { Atlas, AtlasTile, Container, Layer } from "decentraland-ui";
import { useAuction } from "../modules/api";
import { AUCTION_HOUSE_CONTRACT_ADDRESS, MANA_TOKEN_CONTRACT_ADDRESS, getChain } from "../eth";
import { toCoords } from "../lib/coords";
import { Navbar } from "../components/Navbar";
import './HomePage.css'

export const HomePage = memo(() => {

  const { data: auction, isLoading } = useAuction()

  const { chain } = useNetwork()
  const { address, isConnected } = useAccount()


  const [bidAmount, setBidAmount] = useState('')

  const { data: allowance, isLoading: isLoadingAllowance } = useContractRead({
    address: MANA_TOKEN_CONTRACT_ADDRESS,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address!, AUCTION_HOUSE_CONTRACT_ADDRESS]
  })

  const isApproved = !isLoadingAllowance && !!allowance && parseInt(formatUnits(allowance, 18)) > 0

  const { write: approve, status: approveStatus, data: approveData } = useContractWrite({
    address: MANA_TOKEN_CONTRACT_ADDRESS,
    abi: erc20ABI,
    functionName: 'approve',
    args: [AUCTION_HOUSE_CONTRACT_ADDRESS, 2n ** 256n - 1n],
  })

  const { write: createBid, status: createBidStatus, data: createBidData } = useContractWrite({
    address: AUCTION_HOUSE_CONTRACT_ADDRESS,
    abi: auctionHouseABI,
    functionName: 'createBid',
    args: [BigInt(auction?.tokenId || 0), parseUnits(parseInt(bidAmount || '0').toString(), 18)],
  })

  const { write: settle } = useContractWrite({
    address: AUCTION_HOUSE_CONTRACT_ADDRESS,
    abi: auctionHouseABI,
    functionName: 'settleCurrentAndCreateNewAuction'
  })

  const { data: createBidTransaction, isError: isCreateBidError, error, status } = useWaitForTransaction(createBidData)

  console.log(createBidTransaction)

  const tiles = useMemo(() => {
    const tiles: Record<string, AtlasTile> = {}
    if (auction) {
      const lastId = Number(auction.tokenId)
      for (let id = 0; id < lastId; id++) {
        const [x, y] = toCoords(id)
        tiles[`${x},${y}`] = {
          x,
          y,
          type: 7,
          owner: '0x'
        }
      }
    }
    return tiles
  }, [auction])

  const isSelected = useCallback((x: number, y: number) => {
    if (auction) {
      const [x2, y2] = toCoords(Number(auction.tokenId))
      if (x === x2 && y === y2) {
        return true
      }
    }
    return false
  }, [auction])

  const selectedStrokeLayer: Layer = useCallback((x, y) => {
    return isSelected(x, y) ? { color: '#ff0044', scale: 1.4 } : null
  }, [isSelected])

  const selectedFillLayer: Layer = useCallback((x, y) => {
    return isSelected(x, y) ? { color: '#ff9990', scale: 1.2 } : null
  }, [isSelected])

  const layers = useMemo(() => {
    return [
      selectedStrokeLayer,
      selectedFillLayer
    ]
  }, [selectedStrokeLayer, selectedFillLayer])

  const [x, y] = useMemo(() => {
    if (auction) {
      return toCoords(Number(auction.tokenId))
    }
    return [0, 0]
  }, [auction])

  return <>
    <Navbar />
    <Atlas tiles={tiles} isDraggable={false} x={x + 15} y={y} height={320} layers={layers}></Atlas>
    <div className="HomePage dcl page">
      <Container>{chain ? <div>Chain ID: {chain.name} {chain.id === getChain().id ? 'is ok' : 'wrong network'}</div> : null}
        <div>{isLoading ? 'Loading...' : JSON.stringify(auction, null, 2)}</div>
        <div>Allowance: {isLoadingAllowance ? 'Loading...' : formatUnits(allowance || 0n, 18)} <button disabled={isApproved} onClick={() => approve!()}>Approve</button> {approveStatus} {JSON.stringify(approveData, null, 2)}</div>
        <div>{isConnected
          ? <>
            <div>Connected to {address}</div>
            <div>
              {!auction || auction.endTime < Date.now()
                ? <button onClick={() => settle()}>Reset</button>
                : isApproved
                  ? <>
                    <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} />
                    <button onClick={() => createBid()}>Bid</button> {createBidStatus} {JSON.stringify(createBidData, null, 2)}
                  </>
                  : null
              }
            </div>
          </>
          : null}
        </div>
        {status}
        {isCreateBidError ? <div>{error?.message}</div> : null}
        <br />
      </ Container>
    </div >
  </>
});
