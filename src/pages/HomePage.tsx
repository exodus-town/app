import { memo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { auctionHouseABI } from "@exodus.town/contracts";
import { erc20ABI, useAccount, useConnect, useContractRead, useContractWrite, useWaitForTransaction } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useAuction } from "../modules/api";
import { AUCTION_HOUSE_CONTRACT_ADDRESS, MANA_TOKEN_CONTRACT_ADDRESS } from "../eth";
import './HomePage.css'

export const HomePage = memo(() => {

  const { data: auction, isLoading } = useAuction()

  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })

  const [bidAmount, setBidAmount] = useState('')

  const { data: mana, isLoading: isLoadingMana } = useContractRead({
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

  const { write: reset } = useContractWrite({
    address: AUCTION_HOUSE_CONTRACT_ADDRESS,
    abi: auctionHouseABI,
    functionName: 'settleCurrentAndCreateNewAuction'
  })

  const { data: createBidTransaction, isError: isCreateBidError, error, status } = useWaitForTransaction(createBidData)

  console.log(createBidTransaction)

  return <div className="HomePage">
    <div>{isLoading ? 'Loading...' : JSON.stringify(auction, null, 2)}</div>
    <div>MANA: {isLoadingMana ? 'Loading...' : formatUnits(mana || 0n, 18)}</div>
    <div>Allowance: {isLoadingAllowance ? 'Loading...' : formatUnits(allowance || 0n, 18)} <button disabled={isApproved} onClick={() => approve!()}>Approve</button> {approveStatus} {JSON.stringify(approveData, null, 2)}</div>
    <div>{isConnected
      ? <>
        <div>Connected to {address}</div>
        <div>
          {!auction || auction.endTime < Date.now()
            ? <button onClick={() => reset()}>Reset</button>
            : isApproved
              ? <>
                <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} />
                <button onClick={() => createBid()}>Bid</button> {createBidStatus} {JSON.stringify(createBidData, null, 2)}
              </>
              : null
          }
        </div>
      </>
      : <button onClick={() => connect()}>Connect Wallet</button>}
    </div>
    {status}
    {isCreateBidError ? <div>{error?.message}</div> : null}
  </div >
});
