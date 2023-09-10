import { memo, useEffect, useState } from "react";
import { Container } from "decentraland-ui";
import { Navbar } from "../components/Navbar";
import { Auction } from "../components/Auction";
import { Tiles } from "../components/Tiles";
import './HomePage.css'
import { useAuction } from "../modules/auction";

export const HomePage = memo(() => {

  const { auction, isSettled, isWinner } = useAuction()

  const [tokenId, setTokenId] = useState<string>()

  useEffect(() => {
    if (auction) {
      setTokenId(isSettled && !isWinner ? (Number(auction.tokenId) + 1).toString() : auction.tokenId)
    }
  }, [auction, isSettled, isWinner])

  return <>
    <Navbar />
    <Tiles tokenId={tokenId} />
    <div className="HomePage dcl page">
      <Container className="content">
        <Auction tokenId={tokenId} setTokenId={setTokenId} />
      </ Container>
    </div >
  </>
});
