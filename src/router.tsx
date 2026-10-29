import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { TokenPage } from './pages/TokenPage'
import { UnwindPage } from './pages/UnwindPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/unwind',
    element: <UnwindPage />,
  },
  {
    path: '/tokens/:tokenId',
    element: <TokenPage />
  }
])
