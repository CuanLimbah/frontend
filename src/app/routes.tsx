import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { DriverDashboard } from './pages/DriverDashboard';
import { AuthCallback } from './pages/AuthCallback';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: Landing,
      },
      {
        path: 'login',
        Component: Login,
      },
      {
        path: 'register',
        Component: Register,
      },
      {
        path: 'auth/callback',
        Component: AuthCallback,
      },
      {
        path: 'dashboard',
        Component: UserDashboard,
      },
      {
        path: 'admin',
        Component: AdminDashboard,
      },
      {
        path: 'driver',
        Component: DriverDashboard,
      },
    ],
  },
]);
