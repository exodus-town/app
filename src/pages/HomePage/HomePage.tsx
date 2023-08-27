import { memo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchAuction } from "../../modules/auction";
import './HomePage.css'

const HomePage = memo(() => {
  const dispatch = useAppDispatch()

  const auction = useAppSelector(state => state.auction.data)

  useEffect(() => {
    dispatch(fetchAuction())
  }, [dispatch])

  return <div className="HomePage">{JSON.stringify(auction, null, 2)}</div>
});

export default HomePage
