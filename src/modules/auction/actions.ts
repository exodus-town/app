import { action } from 'typesafe-actions'
import { Auction } from './types'

export const FETCH_AUCTION_REQUEST = '[Request] Fetch Auction'
export const fetchAuctionRequest = () => action(FETCH_AUCTION_REQUEST)
export type FetchAuctionRequestAction = ReturnType<typeof fetchAuctionRequest>

export const FETCH_AUCTION_SUCCESS = '[Success] Fetch Auction'
export const fetchAuctionSuccess = (auction: Auction) => action(FETCH_AUCTION_SUCCESS, { auction })
export type FetchAuctionSuccessAction = ReturnType<typeof fetchAuctionSuccess>

export const FETCH_AUCTION_FALIURE = '[Failure] Fetch Auction'
export const fetchAuctionFailure = (error: string) => action(FETCH_AUCTION_FALIURE, { error })
export type FetchAuctionFailureAction = ReturnType<typeof fetchAuctionFailure>
