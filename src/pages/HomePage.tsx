import { memo } from "react";
import { useAuction } from "../modules/api";
import './HomePage.css'

export const HomePage = memo(() => {

  const { data: auction, isLoading } = useAuction()

  return <div className="HomePage">{isLoading ? 'Loading...' : JSON.stringify(auction, null, 2)}</div>
});
