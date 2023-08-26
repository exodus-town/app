import { LoadingState, loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import { Auction } from './types'
import {
  FETCH_AUCTION_FALIURE,
  FETCH_AUCTION_REQUEST,
  FETCH_AUCTION_SUCCESS,
  FetchAuctionFailureAction,
  FetchAuctionRequestAction,
  FetchAuctionSuccessAction,
} from './actions'

type AuctionState = {
  data: Auction | null
  loading: LoadingState
  error: string | null
}

const initialState: AuctionState = {
  data: null,
  loading: [],
  error: null,
}

type AuctionReducerAction = FetchAuctionRequestAction | FetchAuctionSuccessAction | FetchAuctionFailureAction

export function auctionReducer(state = initialState, action: AuctionReducerAction): AuctionState {
  switch (action.type) {
    case FETCH_AUCTION_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: null,
      }
    }
    case FETCH_AUCTION_FALIURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error,
      }
    }
    case FETCH_AUCTION_SUCCESS: {
      return {
        ...state,
        data: action.payload.auction,
        loading: loadingReducer(state.loading, action),
        error: null,
      }
    }
    default:
      return state
  }
}
