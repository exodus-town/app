import { memo, useEffect } from "react";
import { Props } from "./HomePage.types";

const HomePage = memo<Props>(({ auction, onFetchAuction }) => {
  useEffect(() => {
    onFetchAuction()
  }, [onFetchAuction])
  return <div className="HomePage">{JSON.stringify(auction, null, 2)}</div>
});

export default HomePage
