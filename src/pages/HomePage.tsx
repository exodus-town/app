import { memo } from "react";
import { Container } from "decentraland-ui";
import { Navbar } from "../components/Navbar";
import { Auction } from "../components/Auction";
import { Tiles } from "../components/Tiles";
import './HomePage.css'

export const HomePage = memo(() => {

  return <>
    <Navbar />
    <Tiles />
    <div className="HomePage dcl page">
      <Container className="content">
        <Auction />
      </ Container>
    </div >
  </>
});
