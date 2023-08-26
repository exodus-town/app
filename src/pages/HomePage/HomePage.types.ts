import { Dispatch } from 'redux'
import { FetchAuctionRequestAction, fetchAuctionRequest } from '../../modules/auction/actions'
import { Auction } from '../../modules/auction/types'

export type Props = {
  auction: Auction | null
  loading: boolean
  error: string | null
  onFetchAuction: typeof fetchAuctionRequest
}

export type MapStateProps = Pick<Props, 'auction' | 'error' | 'loading'>
export type MapDispatchProps = Pick<Props, 'onFetchAuction'>
export type MapDispatch = Dispatch<FetchAuctionRequestAction>
