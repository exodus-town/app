import { call, put, takeEvery } from 'redux-saga/effects'
import { FETCH_AUCTION_REQUEST, fetchAuctionSuccess } from './actions'

export function* auctionSaga() {
  yield takeEvery(FETCH_AUCTION_REQUEST, handleFetchAuctionRequest)
}

function* handleFetchAuctionRequest() {
  yield call(() => console.log('fetching auction'))
  yield put(
    fetchAuctionSuccess({
      amount: 100,
      bidder: '0x',
      reserve: 100,
      startTime: 0,
      endTime: 0,
      settled: false,
      tokenId: '1',
    })
  )
}
