import { createBrowserRouter, Navigate} from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import WorkspacePage from './pages/WorkspacePage'
import ExplorePage from './pages/ExplorePage'
import ProfilePage from './pages/ProfilePage'
import FavoritesPage from './pages/FavoritesPage'
import SettingsPage from './pages/SettingsPage'
import EditorPage from './pages/EditorPage'
import LoginPage from './pages/LoginPage'



export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/workspace" replace /> },
      { path: 'workspace', element: <WorkspacePage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'editor/:imageId', element: <EditorPage /> },
    ],
  },
])