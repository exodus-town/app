import { memo, useEffect, useState } from "react";
import { Button, Container } from "decentraland-ui";
import { Navbar } from "../components/Navbar";
import { Auction } from "../components/Auction";
import { Tiles } from "../components/Tiles";
import { useAuction } from "../modules/auction";
import './HomePage.css'

export const HomePage = memo(() => {

  const { auction, isSettled, isWinner } = useAuction()
  const [wasWinner, setWasWinner] = useState(false)
  const [tokenId, setTokenId] = useState<string>()

  useEffect(() => {
    if (auction) {
      setTokenId(isSettled && !isWinner && !wasWinner ? (Number(auction.tokenId) + 1).toString() : auction.tokenId)
    }
  }, [auction, isSettled, isWinner, wasWinner])

  useEffect(() => {
    if (isWinner && !wasWinner) {
      setWasWinner(true)
    }
  }, [isWinner, wasWinner])

  return <>
    <Navbar />
    <Tiles tokenId={tokenId} setTokenId={setTokenId} />
    <div className="HomePage dcl page">
      <Container className="content">
        <Auction tokenId={tokenId} setTokenId={setTokenId} />
        <div className="content">
          <h1>Welcome to Exodus Town <Button primary className="jump-in" href="https://play.decentraland.org?realm=exodus.town">Jump In <i className="jump-in-icon" /></Button></h1>

          <h3>The World</h3>
          <p>Exodus Town is an experiment on Decentraland Worlds, continuous issuance, and DAOs. Originating from the 0,0 coordinate, it expands in a never-ending spiral, growing one parcel per day, forever.</p>

          <h3>The Token</h3>
          <p>The $TOWN token is a distinctive NFT for a couple of reasons. First, it allows its holder to publish content on Exodus Town parcels, akin Decentraland $LAND. Second, France. Third, the proceeds from $TOWN auctions don't go to a developer team, instead they directly enter the Exodus DAO treasury, ensuring it stays in the hands of the token holders.</p>

          <h3>The Auctions</h3>
          <p>Exodus Town features daily auctions in which one $TOWN token is made available for purchase using MANA every 24 hours. This activity is not only about buying digital real estate but also about contributing to a community treasury. 100% of the proceeds from the auction go directly into the Exodus DAO, ensuring transparent and direct allocation of resources.</p>

          <h3>The DAO</h3>
          <p>The Exodus Town governance is fully on-chain, based on <a href="https://docs.openzeppelin.com/contracts/4.x/api/governance#governor" target="_blank">OpenZeppelin's Governor</a> and deployed on the Polygon Network. This stands in contrast to snapshot-based DAOs. Here, each $TOWN token is equivalent to one vote, and these votes directly control the treasury and any proposals, without requiring off-chain actions or human intervention.</p>

          <h3>The Editor</h3>
          <p>The Decentraland's Web Editor is integrated into Exodus Town, allowing content to be created and published directly on parcels. The editor is open to everyone and doesn't require coding skills.</p>

          <h3>The Deployers</h3>
          <p>The Deployers of Exodus Town have opted for a different compensation model, distinct from the common practice of taking a percentage of auction proceeds. For the first two years of the project, every 10th $TOWN token (ID #0, ID #10, ID #20, etc.) will be sent to the Deployers' Multisig. These tokens are vested and will be shared among its members, without affecting the cadence of daily auctions.</p>
        </div>
      </ Container>
    </div >
  </>
});
