import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { TokenPage } from './pages/TokenPage'
import { UnwindPage } from './pages/UnwindPage'
import { AuthPage } from './pages/AuthPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    // The web explorer at /play signs in here (see AuthPage).
    path: '/auth/login',
    element: <AuthPage />,
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
