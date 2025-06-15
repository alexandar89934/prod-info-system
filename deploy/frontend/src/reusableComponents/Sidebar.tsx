import {
  SettingsOutlined,
  ChevronLeft,
  ChevronRightOutlined,
  HomeOutlined,
  Groups2Outlined,
  ReceiptLongOutlined,
  PublicOutlined,
  PointOfSaleOutlined,
  TodayOutlined,
  CalendarMonthOutlined,
  AdminPanelSettingsOutlined,
  TrendingUpOutlined,
  PieChartOutlined,
  CheckCircleOutline,
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
  { text: 'Person Manage', icon: null },
  { text: 'Person', icon: <Groups2Outlined /> },
  { text: 'Workplace', icon: <ReceiptLongOutlined /> },
  { text: 'machineAvailabilityStatus', icon: <CheckCircleOutline /> },
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

  const handleProfileClick = () => {
    navigate('/profilePage');
  };

  useEffect(() => {
    setActive(pathname.substring(1));
  }, [pathname]);

  return (
    <Box component="nav">
      <Drawer
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        variant={isNonMobile ? 'persistent' : 'temporary'}
        anchor="left"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.secondary[200],
            borderRight: isNonMobile
              ? 'none'
              : `1px solid ${theme.palette.divider}`,
            position: isNonMobile ? 'relative' : 'fixed',
            top: isNonMobile ? 0 : '64px',
            height: isNonMobile ? '100vh' : 'calc(100vh - 64px)',
            zIndex: isNonMobile ? theme.zIndex.drawer : theme.zIndex.drawer + 1,
            overflowY: 'auto',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.primary[900],
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.background.paper,
            },
          },
        }}
      >
        <Box display="flex" flexDirection="column" height="100%">
          <Box m="1.5rem 2rem 2rem 3rem">
            <FlexBetween color={theme.palette.secondary.main}>
              <Box display="flex" alignItems="center" gap="0.5rem">
                <Typography variant="h4" fontWeight="bold">
                  Production Info System
                </Typography>
              </Box>
              {!isNonMobile ? (
                <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                  <ChevronLeft />
                </IconButton>
              ) : null}
            </FlexBetween>
          </Box>

          <Box flexGrow={1}>
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
                        if (!isNonMobile) {
                          setIsSidebarOpen(false);
                        }
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
                      {active === lcText ? (
                        <ChevronRightOutlined sx={{ ml: 'auto' }} />
                      ) : null}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          <Box position="relative" padding="1rem 2rem">
            <Divider />
            {isLoggedIn ? (
              <FlexBetween textTransform="none" gap="1rem" m="1.5rem 0 0">
                <Box textAlign="left">
                  <Typography
                    fontWeight="bold"
                    fontSize="0.9rem"
                    sx={{ color: theme.palette.secondary[100] }}
                  >
                    {user.name}
                  </Typography>
                </Box>
                <IconButton onClick={handleProfileClick}>
                  <SettingsOutlined
                    sx={{
                      color: theme.palette.secondary[300],
                      fontSize: '25px',
                    }}
                  />
                </IconButton>
              </FlexBetween>
            ) : null}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;
