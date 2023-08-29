import { memo, useState } from "react";
import { useAuction } from "../modules/api";
import './HomePage.css'
import { useAccount, useConnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useAppDispatch } from "../store";
import { bid, reset } from "../modules/contract";

export const HomePage = memo(() => {

  const { data: auction, isLoading } = useAuction()

  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })

  const [bidAmount, setBidAmount] = useState('')

  const dispatch = useAppDispatch()

  return <div className="HomePage">
    <div>{isLoading ? 'Loading...' : JSON.stringify(auction, null, 2)}</div>
    <div>{isConnected
      ? <>
        <div>Connected to {address}</div>
        <div>
          {!auction || auction.endTime < Date.now()
            ? <button onClick={() => dispatch(reset())}>Reset</button>
            : <>
              <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} />
              <button onClick={() => dispatch(bid({ tokenId: auction.tokenId, amount: parseInt(bidAmount) }))}>Bid</button></>
          }
        </div>
      </>
      : <button onClick={() => connect()}>Connect Wallet</button>}</div>
  </div >
});
