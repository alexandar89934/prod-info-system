import { Box, useMediaQuery, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

import Navbar from '@/reusableComponents/Navbar.tsx';
import Sidebar from '@/reusableComponents/Sidebar.tsx';
import { getName } from '@/state/auth/auth.selectors.ts';

type LayoutProps = object;

const Layout: React.FC<LayoutProps> = () => {
  const theme = useTheme();
  const isNonMobile = useMediaQuery(theme.breakpoints.up('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(isNonMobile);
  const data = {
    name: useSelector(getName),
  };

  const drawerWidth = isSidebarOpen ? '250px' : '0px';

  useEffect(() => {
    setIsSidebarOpen(isNonMobile);
  }, [isNonMobile]);

  return (
    <Box display={isNonMobile ? 'flex' : 'block'} width="100%" height="100%">
      <Sidebar
        user={data}
        isNonMobile={isNonMobile}
        drawerWidth={drawerWidth}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <Box flexGrow={1}>
        <Navbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isNonMobile={isNonMobile}
          isTablet={isTablet}
        />
        <Outlet />
      </Box>
    </Box>
  );
};
export default Layout;
