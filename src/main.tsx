import React from 'react'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { store } from './store'
import { router } from './router'

import 'decentraland-ui/lib/styles.css'
import 'decentraland-ui/lib/dark-theme.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
)
