import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { TokenPage } from './pages/TokenPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/tokens/:tokenId',
    element: <TokenPage />
  }
])
