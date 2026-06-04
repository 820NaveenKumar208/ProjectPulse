import { Outlet } from 'react-router-dom';

import { AuthProvider } from './lib/AuthProvider';

export function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
