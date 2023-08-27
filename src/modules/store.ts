// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import createSagasMiddleware from 'redux-saga'
import { createLogger } from 'redux-logger'
import { configureStore } from '@reduxjs/toolkit'
import { Env } from '@dcl/ui-env'
import { reducer } from './reducer'
import { config } from '../config'
import { rootSaga } from './saga'

const sagasMiddleware = createSagasMiddleware()
const loggerMiddleware = createLogger({
  predicate: () => config.is(Env.DEVELOPMENT),
  collapsed: () => true,
})

const store = configureStore({
  reducer,
  middleware: [sagasMiddleware, loggerMiddleware],
  devTools: config.is(Env.DEVELOPMENT),
})

sagasMiddleware.run(rootSaga, store)

export { store }
