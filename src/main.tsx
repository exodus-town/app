import React from 'react'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom/client'
import { HomePage } from './pages/HomePage'
import { store } from './modules/store'

import 'decentraland-ui/lib/styles.css'
import 'decentraland-ui/lib/dark-theme.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <HomePage />
    </Provider>
  </React.StrictMode>,
)
