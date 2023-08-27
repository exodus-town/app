import { RootState } from '../reducer'

export const getState = (state: RootState) => state.auction
export const getAuction = (state: RootState) => getState(state).data
export const getError = (state: RootState) => getState(state).error
export const isLoading = (state: RootState) => getState(state).loading
