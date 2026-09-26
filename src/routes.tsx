import { createBrowserRouter } from 'react-router'
import Root from './components/Root'
import HomePage from './pages/HomePage'
import FAQPage from './pages/FAQPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import UpdatesPage from './pages/UpdatesPage'
import SuccessPage from './pages/SuccessPage'
import ActivatePage from './pages/ActivatePage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: 'faq', Component: FAQPage },
      { path: 'updates', Component: UpdatesPage },
      { path: 'terms', Component: TermsPage },
      { path: 'privacy', Component: PrivacyPage },
      { path: 'success', Component: SuccessPage },
      { path: 'activate', Component: ActivatePage },
      { path: 'download', Component: ActivatePage },
    ],
  },
])
