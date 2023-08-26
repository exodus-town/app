import { connect } from 'react-redux'
import { fetchAuctionRequest } from '../../modules/auction/actions'
import { getAuction, getError, isLoading } from '../../modules/auction/selectors'
import { RootState } from '../../modules/reducer'
import { MapDispatch, MapDispatchProps, MapStateProps } from './HomePage.types'
import HomePage from './HomePage'

const mapState = (state: RootState): MapStateProps => ({
  auction: getAuction(state),
  error: getError(state),
  loading: isLoading(state),
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchAuction: () => dispatch(fetchAuctionRequest()),
})

export default connect(mapState, mapDispatch)(HomePage)
