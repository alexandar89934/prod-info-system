import {
  LightModeOutlined,
  DarkModeOutlined,
  Menu as MenuIcon,
  Search,
  SettingsOutlined,
  ArrowDropDownOutlined,
} from '@mui/icons-material';
import {
  AppBar,
  Button,
  Box,
  Typography,
  IconButton,
  InputBase,
  Toolbar,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material';
import Link from '@mui/material/Link';
import React, { useState, MouseEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import FlexBetween from './FlexBetween.tsx';

import { logout } from '@/state/auth/auth.actions.ts';
import { getIsLoggedIn } from '@/state/auth/auth.selectors.ts';
import { getProfilePicture } from '@/state/auth/auth.selectors.ts';
import { setMode } from '@/state/theme/theme.slice.ts';

type NavbarProps = {
  user: {
    name: string;
  };
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
};

const Navbar: React.FC<NavbarProps> = ({
  user,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);
  const navigate = useNavigate();
  const isLoggedIn: boolean = useSelector(getIsLoggedIn);
  const profilePicture = useSelector(getProfilePicture);
  useEffect(() => {
    console.log('isLoggedIn changed:', isLoggedIn);
    // You can trigger any logic here, like refetching data
  }, [isLoggedIn]);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const onLogoutClick = () => {
    logout({ dispatch });
    navigate('/');
  };
  const handleProfileClick = () => {
    navigate('/profilePage');
  };
  return (
    <AppBar
      sx={{
        position: 'fixed',
        top: 0,
        left: isSidebarOpen ? '250px' : '0',
        right: 0,
        width: isSidebarOpen ? `calc(100% - 250px)` : '100%',
        background: 'none',
        boxShadow: 'none',
        zIndex: 1300,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* LEFT SIDE */}
        <FlexBetween>
          <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MenuIcon />
          </IconButton>
          <FlexBetween borderRadius="9px" gap="3rem" p="0.1rem 1.5rem">
            <InputBase placeholder="Search..." />
            <IconButton>
              <Search />
            </IconButton>
          </FlexBetween>
        </FlexBetween>

        {/* RIGHT SIDE */}
        <FlexBetween gap="1.5rem">
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === 'dark' ? (
              <DarkModeOutlined sx={{ fontSize: '25px' }} />
            ) : (
              <LightModeOutlined sx={{ fontSize: '25px' }} />
            )}
          </IconButton>
          {isLoggedIn && (
            <IconButton onClick={handleProfileClick}>
              <SettingsOutlined sx={{ fontSize: '25px' }} />
            </IconButton>
          )}
          <FlexBetween>
            {isLoggedIn ? (
              <Button
                onClick={handleClick}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textTransform: 'none',
                  gap: '1rem',
                }}
              >
                <Box
                  component="img"
                  alt="profile"
                  src={profilePicture}
                  height="32px"
                  width="32px"
                  borderRadius="50%"
                  sx={{ objectFit: 'cover' }}
                />
                <Box textAlign="left">
                  <Typography
                    fontWeight="bold"
                    fontSize="0.85rem"
                    sx={{ color: theme.palette.secondary[100] }}
                  >
                    {user.name}
                  </Typography>
                  <Typography
                    fontSize="0.75rem"
                    sx={{ color: theme.palette.secondary[200] }}
                  />
                </Box>
                <ArrowDropDownOutlined
                  sx={{ color: theme.palette.secondary[300], fontSize: '25px' }}
                />
              </Button>
            ) : (
              <Button
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textTransform: 'none',
                  gap: '1rem',
                }}
              >
                <Box textAlign="left">
                  <Typography
                    fontWeight="bold"
                    fontSize="0.85rem"
                    sx={{ color: theme.palette.secondary[100] }}
                  >
                    <Link
                      href="/login"
                      underline="hover"
                      sx={{
                        color: theme.palette.secondary[100],
                        fontWeight: 'bold',
                      }}
                    >
                      Log In
                    </Link>
                  </Typography>
                </Box>
              </Button>
            )}
            {isLoggedIn && (
              <Menu
                anchorEl={anchorEl}
                open={isOpen}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                <MenuItem onClick={onLogoutClick}>Log Out</MenuItem>
              </Menu>
            )}
          </FlexBetween>
        </FlexBetween>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
