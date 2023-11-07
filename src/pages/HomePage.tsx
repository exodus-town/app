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
              <p>The TOWN token allows its holder to publish content on Exodus Town parcels, akin to Decentraland's LAND token.</p>
            </Accordion>
            <Accordion title="The Auction">
              <p>Exodus Town features daily auctions in which one TOWN token is made available for purchase using MANA every 24 hours, and 100% of the proceeds from the auction go directly into the Exodus DAO.</p>
            </Accordion>
            <Accordion title="The DAO">
              <p>The Exodus Town governance is fully on-chain, based on <a href="https://docs.openzeppelin.com/contracts/4.x/api/governance#governor" target="_blank">OpenZeppelin's Governor</a>. This stands in contrast to snapshot-based DAOs. Here, each TOWN token is equivalent to one vote, and these votes directly control the treasury and any proposals, without requiring off-chain actions or human intervention.</p>
            </Accordion>
            <Accordion title="The Parcels">
              <p>Parcels in Exodus Town are equivalent in size to a 3x3 Estate in Decentraland, so they are 9 times larger.</p>
            </Accordion>
            <Accordion title="The Editor">
              <p>The Decentraland's Web Editor is integrated into Exodus Town, allowing content to be created and published directly onto parcels. The editor is open to everyone and doesn't require coding skills.</p>
            </Accordion>
            {maxTokenId < 100 && <Accordion title="The Awakening">
              <p>During its initial phase, the Exodus DAO will be in "sleep mode" on which proposals will be disabled. This is to guard against potential 51% attacks while the TOWN token supply is too low. Once the supply reaches the pivotal count of 100, the Exodus DAO will automatically enter in "awake mode" and TOWN holders will be able to start submitting proposals and make use of the treasury.</p>
            </Accordion>}
            <Accordion title="The Source">
              <p>The <a href={getContractUrl(TOWN_TOKEN_CONTRACT_ADDRESS)}>TownToken.sol</a>, and <a href={getContractUrl(EXODUS_DAO_CONTRACT_ADDRESS)}>ExodusDAO.sol</a> were created using the <a href="https://wizard.openzeppelin.com/">OpenZeppelin Wizard</a>, and the <a href={getContractUrl(AUCTION_HOUSE_CONTRACT_ADDRESS)}>AuctionHouse.sol</a> is a fork of <a href="https://nouns.wtf">NounsDAO</a>'s <a href="https://github.com/nounsDAO/nouns-monorepo/blob/master/packages/nouns-contracts/contracts/NounsAuctionHouse.sol">NounsAuctionHouse</a>.</p>
              <p>All the contracts are deployed on the Polygon network and verified on PolygonScan.</p>
              <p>Exodus Town uses a custom realm to integrate the TOWN token and serve the contents of the world.</p>
              <p>Everything, including this interface, is public and <a href="https://github.com/exodus-town">open source</a>.</p>
              <p>There is <b className="warning"><IoMdWarning />NO AUDIT</b>.</p>
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
