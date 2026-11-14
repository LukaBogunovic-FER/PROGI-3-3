import { createBrowserRouter, Navigate} from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import WorkspacePage from './pages/WorkspacePage'
import ExplorePage from './pages/ExplorePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/workspace" replace /> },
      { path: 'workspace', element: <WorkspacePage /> },
      { path: 'explore', element: <ExplorePage /> },
    ],
  },
])