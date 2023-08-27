import { Store, combineReducers } from 'redux'
import { auctionReducer } from './auction/reducer'

export const reducer = combineReducers({
  auction: auctionReducer,
})

export type RootState = ReturnType<typeof reducer>
export type RootStore = Store<RootState>
