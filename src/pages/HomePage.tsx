import { memo } from "react";
import { useGetAuctionQuery } from "../modules/api";
import './HomePage.css'

export const HomePage = memo(() => {

  const { data: auction, isLoading } = useGetAuctionQuery()

  return <div className="HomePage">{isLoading ? 'Loading...' : JSON.stringify(auction, null, 2)}</div>
});
