import { memo, useEffect, useState } from "react";
import { Button, Container } from "decentraland-ui";
import { IoMdWarning } from 'react-icons/io'
import { Navbar } from "../components/Navbar";
import { Auction } from "../components/Auction";
import { Tiles } from "../components/Tiles";
import { useAuction } from "../modules/auction";
import { AUCTION_HOUSE_CONTRACT_ADDRESS, EXODUS_DAO_CONTRACT_ADDRESS, TOWN_TOKEN_CONTRACT_ADDRESS, getContractUrl } from "../eth";
import './HomePage.css'
import { Accordion } from "../components/Accordion";

export const HomePage = memo(() => {

  const { maxTokenId } = useAuction()
  const [tokenId, setTokenId] = useState<string>()

  useEffect(() => {
    setTokenId(maxTokenId.toString())
  }, [maxTokenId])

  return <>
    <Navbar />
    <Tiles tokenId={tokenId} setTokenId={setTokenId} />
    <div className="HomePage dcl page">
      <Container className="content">
        <Auction tokenId={tokenId} setTokenId={setTokenId} />
        <div className="content">
          <div className="welcome">
            <h1 className="title">Welcome to Exodus Town <Button size="large" primary className="jump-in" href="https://play.decentraland.org?realm=exodus.town"><span className="text">Jump In</span> <i className="jump-in-icon" /></Button></h1>
            <p>Exodus Town is an experiment on Decentraland Worlds, continuous issuance, and DAOs. Originating from the 0,0 coordinate, it expands in a never-ending spiral, growing <b>one parcel per day, forever</b>.</p>
            <p>Every 24 hours, a TOWN token is auctioned off in exchange for MANA, granting the holder the ability to publish content to Exodus Town. Importantly, all auction proceeds flow directly into the on-chain governed Exodus DAO, steered exclusively by TOWN token holders.</p>
          </div>

          <div className="learn-more">
            <h2>Learn More</h2>

            <Accordion title="The Token">
              <p>The TOWN token is a distinctive NFT for a couple of reasons. First, it allows its holder to publish content on Exodus Town parcels, akin to Decentraland's LAND token. Second, France. Third, the proceeds from TOWN auctions don't go to a developer team, instead they directly enter the Exodus DAO treasury, ensuring it stays in the hands of the token holders.</p>
            </Accordion>
            <Accordion title="The Auction">
              <p>Exodus Town features daily auctions in which one TOWN token is made available for purchase using MANA every 24 hours. This activity is not only about buying digital real estate but also about contributing to a community treasury. 100% of the proceeds from the auction go directly into the Exodus DAO.</p>
            </Accordion>
            <Accordion title="The DAO">
              <p>The Exodus Town governance is fully on-chain, based on <a href="https://docs.openzeppelin.com/contracts/4.x/api/governance#governor" target="_blank">OpenZeppelin's Governor</a>. This stands in contrast to snapshot-based DAOs. Here, each TOWN token is equivalent to one vote, and these votes directly control the treasury and any proposals, without requiring off-chain actions or human intervention.</p>
            </Accordion>
            <Accordion title="The Editor">
              <p>The Decentraland's Web Editor is integrated into Exodus Town, allowing content to be created and published directly onto parcels. The editor is open to everyone and doesn't require coding skills.</p>
            </Accordion>
            {maxTokenId < 100 && <Accordion title="The Awakening">
              <p>During its initial phase, the Exodus DAO enters a "sleeping period" to guard against potential 51% attacks, because of a low supply of TOWN tokens. While the DAO is designed to empower TOWN token holders, governance proposals are on hold until the token supply reaches the pivotal count of 100. Expected to unfold over approximately three months due to daily auctions, this milestone will trigger the "awakening" of the Exodus DAO, activating its full governance capabilities and allowing token holders to begin submitting proposals.</p>
            </Accordion>}
            <Accordion title="The Deployer">
              <p>The Deployer of Exodus Town have opted for a different compensation model, distinct from the common practice of taking a percentage of auction proceeds. For the first two years of the project, every 10th TOWN token (ID #0, ID #10, ID #20, etc.) will be sent to the Deployer's Multisig, to be shared among its members. This will not affect the cadence of daily auctions.</p>
            </Accordion>
            <Accordion title="The Contracts">
              <p>The <a href={getContractUrl(TOWN_TOKEN_CONTRACT_ADDRESS)}>TownToken.sol</a>, and <a href={getContractUrl(EXODUS_DAO_CONTRACT_ADDRESS)}>ExodusDAO.sol</a> were created using the <a href="https://wizard.openzeppelin.com/">OpenZeppelin Wizard</a>, and the <a href={getContractUrl(AUCTION_HOUSE_CONTRACT_ADDRESS)}>AuctionHouse.sol</a> is a fork of <a href="https://nouns.wtf">NounsDAO</a>'s <a href="https://github.com/nounsDAO/nouns-monorepo/blob/master/packages/nouns-contracts/contracts/NounsAuctionHouse.sol">NounsAuctionHouse</a>.<br />All the contracts are deployed on the Polygon network and verified on PolygonScan.
                <br />Everything, including this interface, is public and <a href="https://github.com/exodus-town">open source</a>.
                <br />There is <b className="warning"><IoMdWarning />NO AUDIT</b>.</p>
            </Accordion>
          </div>

          <div className="disclaimer">
            <h2>Disclaimer</h2>
            <p>Please note that none of the information provided here constitutes financial advice. Exercise your own judgment and consult professionals before making any investment decisions. Exodus Town is a product of what might be described as a self-hatred fueled, narcotics-induced coding extravaganza. To put it bluntly, this is a high-risk experiment in the Metaverse; it's uncharted waters with unpredictable tides. By interacting with Exodus Town through this interface, you implicitly agree to not expect any guaranteed outcome, benefit, or return on investment. You acknowledge that you're essentially venturing into a digital Wild West where anything can happen—and probably will. <b>Proceed with caution, intrepid explorer.</b></p>
          </div>
        </div>
      </ Container>
    </div >
  </>
});
