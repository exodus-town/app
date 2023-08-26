import { History } from 'history'
import { Store, combineReducers } from 'redux'
import { auctionReducer } from './auction/reducer'
import { connectRouter } from 'connected-react-router'

export function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    auction: auctionReducer,
  })
}

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>
export type RootStore = Store<RootState>
