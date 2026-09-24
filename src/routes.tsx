import { createBrowserRouter } from 'react-router'
import Root from './components/Root'
import HomePage from './pages/HomePage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import UpdatesPage from './pages/UpdatesPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: 'updates', Component: UpdatesPage },
      { path: 'terms', Component: TermsPage },
      { path: 'privacy', Component: PrivacyPage },
    ],
  },
])
