import React from 'react'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { polygon, polygonMumbai } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'

import { store } from './store'
import { router } from './router'

import 'decentraland-ui/lib/styles.css'
import 'decentraland-ui/lib/dark-theme.css'


const { publicClient, webSocketPublicClient } = configureChains(
  [polygon, polygonMumbai],
  [publicProvider()],
)

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </WagmiConfig>
  </React.StrictMode>,
)
