import { memo, useEffect, useState } from "react";
import { Button, Container } from "decentraland-ui";
import { SlMagnifier } from "react-icons/sl";
import { IoMdWarning, IoMdLogIn } from "react-icons/io";
import { FaDiscord } from "react-icons/fa";
import { Navbar } from "../components/Navbar";
import { ParcelPanel } from "../components/ParcelPanel";
import { Tiles } from "../components/Tiles";
import { Accordion } from "../components/Accordion";
import { useTown } from "../modules/town";
import { useTreasury } from "../modules/treasury";
import { INVITE_LINK, useDiscord } from "../modules/discord";
import { useOnline } from "../modules/online";
import { Link } from "react-router-dom";
import { config } from "../config";
import { PROPOSAL_NUMBER } from "../lib/unwind";
import {
  AUCTION_HOUSE_CONTRACT_ADDRESS,
  EXODUS_DAO_CONTRACT_ADDRESS,
  TOWN_TOKEN_CONTRACT_ADDRESS,
  getContractUrl,
} from "../eth";
import "./HomePage.css";
import { getPlayUrl } from "../lib/play";

export const HomePage = memo(() => {
  const { owners, lastTokenId } = useTown();
  const [tokenId, setTokenId] = useState<string>();
  const { members, isLoading: isLoadingMembers } = useDiscord();
  const { treasury, isLoading: isLoadingTreasury } = useTreasury();
  const { users, isLoading: isLoadingUsers } = useOnline();

  // Start on the last plot sold (the last one minted may still sit unsold in the auction house).
  const lastSold = owners.findLastIndex(
    ({ owner }) =>
      owner.toLowerCase() !== AUCTION_HOUSE_CONTRACT_ADDRESS.toLowerCase()
  );
  useEffect(() => {
    if (lastSold >= 0 && tokenId === undefined) setTokenId(String(lastSold));
  }, [lastSold, tokenId]);

  return (
    <>
      <Navbar />
      <Tiles tokenId={tokenId} setTokenId={setTokenId} />
      <div className="HomePage dcl page">
        <Container className="content">
          <ParcelPanel tokenId={tokenId} setTokenId={setTokenId} />
          <div className="content">
            <div className="welcome">
              <h1 className="title">
                Welcome to Exodus Town{" "}
                <Button
                  size="large"
                  primary
                  className="jump-in"
                  href={getPlayUrl()}
                >
                  <span className="text">Jump In</span>{" "}
                  <i className="jump-in-icon" />
                </Button>
              </h1>
              <p>
                Exodus Town is an experiment on Decentraland Worlds, continuous
                issuance, and DAOs. Originating from the 0,0 coordinate, it
                grew in a spiral, <b>one parcel per day</b>, for{" "}
                {lastTokenId > 0 ? lastTokenId : "229"} days.
              </p>
              <p>
                Every 24 hours, a TOWN token was auctioned off in exchange for
                MANA, granting the holder the ability to publish content to
                Exodus Town. All auction proceeds flowed into the on-chain
                governed Exodus DAO, steered exclusively by TOWN token holders.
              </p>
              <p className="unwinding">
                <b>Exodus Town is unwinding.</b> With proposal #
                {PROPOSAL_NUMBER}, the DAO voted to return each plot's
                contribution: every plot can be handed back to the DAO for the
                MANA it sold for at auction. The town stays online as an
                archive, and owners keep their plots on the map and can keep
                building on them, even after returning them.{" "}
                <Link to="/unwind">Unwind your plots →</Link>
              </p>
            </div>

            <Button
              size="large"
              primary
              className="jump-in-mobile"
              href={getPlayUrl()}
            >
              <span className="text">Jump In</span>{" "}
              <i className="jump-in-icon" />
            </Button>

            <div className="stats">
              <div className="stat">
                <h2>Treasury</h2>
                <p className="value">
                  {isLoadingTreasury
                    ? "Loading..."
                    : `$${(+(treasury?.toFixed(2) || "0")).toLocaleString()}`}
                  <Button
                    href={`${config.get(
                      "BLOCK_EXPLORER_URL"
                    )}/tokenholdings?a=${config.get(
                      "EXODUS_DAO_CONTRACT_ADDRESS"
                    )}`}
                    target="_blank"
                    primary
                    size="small"
                    inverted
                    className="discord"
                  >
                    <SlMagnifier className="magnifier-icon" /> View
                  </Button>
                </p>
              </div>

              <div className="stat">
                <h2>Community</h2>
                <p className="value">
                  {isLoadingMembers ? "Loading..." : `${members} Members`}{" "}
                  <Button
                    href={INVITE_LINK}
                    target="_blank"
                    primary
                    size="small"
                    inverted
                    className="discord"
                  >
                    <FaDiscord className="discord-icon" /> Join
                  </Button>
                </p>
              </div>

              {users > 0 ? (
                <div className="stat">
                  <h2>Online</h2>
                  <p className="value">
                    {isLoadingUsers
                      ? "Loading..."
                      : users === 1
                      ? `1 User`
                      : `${users} Users`}{" "}
                    <Button
                      href={getPlayUrl()}
                      primary
                      size="small"
                      inverted
                      className="online"
                    >
                      <IoMdLogIn className="jump-in-icon" />
                      Jump In
                    </Button>
                  </p>
                </div>
              ) : null}
            </div>

            <div className="learn-more">
              <h2>Learn More</h2>

              <Accordion title="The Token">
                <p>
                  The TOWN token allows its holder to publish content on Exodus
                  Town parcels, akin to Decentraland's LAND token. But parcels
                  in Exodus Town are equivalent to a 3x3 Estate in Genesis City,
                  so they are 9 times larger.
                </p>
              </Accordion>
              <Accordion title="The Auction">
                <p>
                  Exodus Town held daily auctions in which one TOWN token was
                  made available for purchase using MANA every 24 hours, and
                  100% of the proceeds went directly into the Exodus DAO. The
                  auctions are paused as part of the unwind.
                </p>
              </Accordion>
              <Accordion title="The DAO">
                <p>
                  The Exodus DAO governance is fully on-chain, based on{" "}
                  <a
                    href="https://docs.openzeppelin.com/contracts/4.x/api/governance#governor"
                    target="_blank"
                  >
                    OpenZeppelin's Governor
                  </a>
                  . This stands in contrast to snapshot-based DAOs. Here, each
                  TOWN token is equivalent to one vote, and these votes directly
                  control the treasury and any proposals, without requiring
                  off-chain actions or human intervention.
                </p>
                <p>
                  Proposal #{PROPOSAL_NUMBER} unwinds the DAO: it moves the MANA
                  paid in every auction into a refund contract, where each plot
                  can be exchanged for what it sold for.{" "}
                  <Link to="/unwind">Read more</Link>.
                </p>
              </Accordion>
              <Accordion title="The Editor">
                <p>
                  The Decentraland's Web Editor is integrated into Exodus Town,
                  allowing content to be created and published directly onto
                  parcels. The editor is open to everyone and doesn't require
                  coding skills.
                </p>
                <p>
                  Advanced users can also deploy content to Exodus Town using
                  the official Decentraland CLI.
                </p>
              </Accordion>
              <Accordion title="The Source">
                <p>
                  The{" "}
                  <a href={getContractUrl(TOWN_TOKEN_CONTRACT_ADDRESS)}>
                    TownToken.sol
                  </a>
                  , and{" "}
                  <a href={getContractUrl(EXODUS_DAO_CONTRACT_ADDRESS)}>
                    ExodusDAO.sol
                  </a>{" "}
                  were created using the{" "}
                  <a href="https://wizard.openzeppelin.com/">
                    OpenZeppelin Wizard
                  </a>
                  , and the{" "}
                  <a href={getContractUrl(AUCTION_HOUSE_CONTRACT_ADDRESS)}>
                    AuctionHouse.sol
                  </a>{" "}
                  is a fork of <a href="https://nouns.wtf">NounsDAO</a>'s{" "}
                  <a href="https://github.com/nounsDAO/nouns-monorepo/blob/master/packages/nouns-contracts/contracts/NounsAuctionHouse.sol">
                    NounsAuctionHouse
                  </a>
                  .
                </p>
                <p>
                  All the contracts are deployed on the Polygon network and
                  verified on PolygonScan.
                </p>
                <p>
                  Exodus Town uses a custom realm to integrate the TOWN token
                  and serve the contents of the world.
                </p>
                <p>
                  Everything, including this interface, is public and{" "}
                  <a href="https://github.com/exodus-town">open source</a>.
                </p>
                <p>
                  There is{" "}
                  <b className="warning">
                    <IoMdWarning />
                    NO AUDIT
                  </b>
                  .
                </p>
              </Accordion>
            </div>

            <div className="disclaimer">
              <h2>Disclaimer</h2>
              <p>
                Please note that none of the information provided here
                constitutes financial advice. Exercise your own judgment and
                consult professionals before making any investment decisions.
                It's important to understand that this is an independent
                community project, and is neither affiliated with nor endorsed
                by the Decentraland Foundation. Exodus Town is a product of what
                might be described as a self-hatred fueled, narcotics-induced
                coding extravaganza. To put it bluntly, this is a high-risk
                experiment in the Metaverse; it's uncharted waters with
                unpredictable tides. By interacting with Exodus Town through
                this interface, you implicitly agree to not expect any
                guaranteed outcome, benefit, or return on investment. You
                acknowledge that you're essentially venturing into a digital
                Wild West where anything can happen—and probably will.{" "}
                <b>Proceed with caution, intrepid explorer.</b>
              </p>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
});
