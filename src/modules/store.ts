// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { createBrowserHistory } from 'history'
import createSagasMiddleware from 'redux-saga'
import { createLogger } from 'redux-logger'
import { createTransactionMiddleware } from 'decentraland-dapps/dist/modules/transaction/middleware'
import { routerMiddleware } from 'connected-react-router'
import { configureStore } from '@reduxjs/toolkit'
import { Env } from '@dcl/ui-env'
import { createRootReducer } from './reducer'
import { config } from '../config'
import { rootSaga } from './saga'

const history = createBrowserHistory()
const reducer = createRootReducer(history)

const historyMiddleware = routerMiddleware(history)
const sagasMiddleware = createSagasMiddleware()
const loggerMiddleware = createLogger({
  predicate: () => config.is(Env.DEVELOPMENT),
  collapsed: () => true,
})

const transactionMiddleware = createTransactionMiddleware()

const store = configureStore({
  reducer,
  middleware: [historyMiddleware, sagasMiddleware, loggerMiddleware, transactionMiddleware],
  devTools: config.is(Env.DEVELOPMENT),
})

sagasMiddleware.run(rootSaga, store)

export { store }
