import React from 'react';
import { useSelector } from 'react-redux';

import Unauthorized from '@/scenes/unauthorized';
import { getIsLoggedIn } from '@/state/auth/auth.selectors';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isLoggedIn = useSelector(getIsLoggedIn);
  if (!isLoggedIn) {
    return <Unauthorized />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;