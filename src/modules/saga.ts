import { all } from 'redux-saga/effects'
import { RootStore } from './reducer'
import { auctionSaga } from './auction/saga'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function* rootSaga(_store: RootStore) {
  yield all([auctionSaga()])
}
