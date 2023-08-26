import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from '../reducer'
import { FETCH_AUCTION_REQUEST } from './actions'

export const getState = (state: RootState) => state.auction
export const getAuction = (state: RootState) => getState(state).data
export const getError = (state: RootState) => getState(state).error
export const isLoading = (state: RootState) => isLoadingType(getState(state).loading, FETCH_AUCTION_REQUEST)
