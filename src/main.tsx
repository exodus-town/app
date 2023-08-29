import React from 'react'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { WagmiConfig } from 'wagmi'
import { Web3Modal } from '@web3modal/react'
import { EthereumClient } from '@web3modal/ethereum'

import { store } from './store'
import { router } from './router'
import { chains, config, walletConnectProjectId } from './wagmi'

import 'decentraland-ui/lib/styles.css'
import 'decentraland-ui/lib/dark-theme.css'



const ethereumClient = new EthereumClient(config, chains)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <WagmiConfig config={config}>
        <RouterProvider router={router} />
        <Web3Modal
          projectId={walletConnectProjectId}
          ethereumClient={ethereumClient}
        />
    </WagmiConfig>
    </Provider>
  </React.StrictMode>,
)
