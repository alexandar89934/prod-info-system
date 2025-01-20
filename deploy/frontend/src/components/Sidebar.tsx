import {
  SettingsOutlined,
  ChevronLeft,
  ChevronRightOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  Groups2Outlined,
  ReceiptLongOutlined,
  PublicOutlined,
  PointOfSaleOutlined,
  TodayOutlined,
  CalendarMonthOutlined,
  AdminPanelSettingsOutlined,
  TrendingUpOutlined,
  PieChartOutlined,
} from '@mui/icons-material';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import profileImage from '../assets/profile.jpeg';

import FlexBetween from './FlexBetween';

import { getIsLoggedIn } from '@/state/auth/auth.selectors.ts';

type NavItem = {
  text: string;
  icon: React.ReactNode | null;
};

type SidebarProps = {
  user: {
    name: string;
  };
  drawerWidth: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isNonMobile: boolean;
};

const navItems: NavItem[] = [
  { text: 'Dashboard', icon: <HomeOutlined /> },
  { text: 'Client Facing', icon: null },
  { text: 'Products', icon: <ShoppingCartOutlined /> },
  { text: 'Customers', icon: <Groups2Outlined /> },
  { text: 'Transactions', icon: <ReceiptLongOutlined /> },
  { text: 'Geography', icon: <PublicOutlined /> },
  { text: 'Sales', icon: null },
  { text: 'Overview', icon: <PointOfSaleOutlined /> },
  { text: 'Daily', icon: <TodayOutlined /> },
  { text: 'Monthly', icon: <CalendarMonthOutlined /> },
  { text: 'Breakdown', icon: <PieChartOutlined /> },
  { text: 'Management', icon: null },
  { text: 'Admin', icon: <AdminPanelSettingsOutlined /> },
  { text: 'Performance', icon: <TrendingUpOutlined /> },
];

const Sidebar: React.FC<SidebarProps> = ({
  user,
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
}) => {
  const { pathname } = useLocation();
  const [active, setActive] = useState<string>('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isLoggedIn: boolean = useSelector(getIsLoggedIn);

  useEffect(() => {
    setActive(pathname.substring(1));
  }, [pathname]);

  return (
    <Box component="nav">
      {isSidebarOpen && (
        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          variant="persistent"
          anchor="left"
          sx={{
            width: drawerWidth,
            '& .MuiDrawer-paper': {
              color: theme.palette.secondary[200],
              backgroundColor: theme.palette.background.paper,
              boxSizing: 'border-box',
              borderWidth: isNonMobile ? 0 : '2px',
              width: drawerWidth,
              overflowY: 'hidden', // Makes scrollbar appear only when content overflows
              '&::-webkit-scrollbar': {
                width: 0, // Hides the scrollbar by default (works on Chrome/Brave/Edge)
              },
              '&:hover::-webkit-scrollbar': {
                width: '8px', // Makes it appear on hover
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: theme.palette.background.paper,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.primary.main,
                borderRadius: '4px',
              },
            },
          }}
        >
          <Box flexGrow={1} overflow="auto">
            {' '}
            {/* Added for scrollable content */}
            <Box m="1.5rem 2rem 2rem 3rem">
              <FlexBetween color={theme.palette.secondary.main}>
                <Box display="flex" alignItems="center" gap="0.5rem">
                  <Typography variant="h4" fontWeight="bold">
                    Production Info System
                  </Typography>
                </Box>
                {!isNonMobile && (
                  <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <ChevronLeft />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>
            <List>
              {navItems.map(({ text, icon }) => {
                if (!icon) {
                  return (
                    <Typography key={text} sx={{ m: '2.25rem 0 1rem 3rem' }}>
                      {text}
                    </Typography>
                  );
                }
                const lcText = text.toLowerCase();
                return (
                  <ListItem key={text} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(`/${lcText}`);
                        setActive(lcText);
                      }}
                      sx={{
                        backgroundColor:
                          active === lcText
                            ? theme.palette.secondary[300]
                            : 'transparent',
                        color:
                          active === lcText
                            ? theme.palette.primary[600]
                            : theme.palette.secondary[100],
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          ml: '2rem',
                          color:
                            active === lcText
                              ? theme.palette.primary[600]
                              : theme.palette.secondary[200],
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText primary={text} />
                      {active === lcText && (
                        <ChevronRightOutlined sx={{ ml: 'auto' }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          <Box position="relative" padding="1rem 2rem">
            {' '}
            {/* User info moved outside of scroll */}
            <Divider />
            {isLoggedIn && (
              <FlexBetween textTransform="none" gap="1rem" m="1.5rem 0 0">
                <Box
                  component="img"
                  alt="profile"
                  src={profileImage}
                  height="40px"
                  width="40px"
                  borderRadius="50%"
                  sx={{ objectFit: 'cover' }}
                />
                <Box textAlign="left">
                  <Typography
                    fontWeight="bold"
                    fontSize="0.9rem"
                    sx={{ color: theme.palette.secondary[100] }}
                  >
                    {user.name}
                  </Typography>
                  <Typography
                    fontSize="0.8rem"
                    sx={{ color: theme.palette.secondary[200] }}
                  />
                </Box>
                <SettingsOutlined
                  sx={{
                    color: theme.palette.secondary[300],
                    fontSize: '25px',
                  }}
                />
              </FlexBetween>
            )}
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
