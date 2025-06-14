import {
  LightModeOutlined,
  DarkModeOutlined,
  Menu as MenuIcon,
  Search,
  SettingsOutlined,
  ArrowDropDownOutlined,
  Close,
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
import React, { useState, MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import FlexBetween from './FlexBetween.tsx';

import { logout } from '@/state/auth/auth.actions.ts';
import { getIsLoggedIn, getName } from '@/state/auth/auth.selectors.ts';
import { getProfilePicture } from '@/state/auth/auth.selectors.ts';
import type { AppDispatch } from '@/state/store';
import { setMode } from '@/state/theme/theme.slice.ts';

type NavbarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isNonMobile: boolean;
  isTablet?: boolean;
};

const Navbar: React.FC<NavbarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
  isTablet,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = !isNonMobile;
  const isMobileOrTablet = isMobile || isTablet;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const isOpen = Boolean(anchorEl);
  const navigate = useNavigate();
  const isLoggedIn: boolean = useSelector(getIsLoggedIn);
  const profilePicture = useSelector(getProfilePicture);
  const name = useSelector(getName);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const onLogoutClick = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profilePage');
  };
  const onChangePassword = () => {
    navigate('/passwordReset');
  };
  const toggleSearch = () => setSearchOpen(!searchOpen);

  return (
    <AppBar
      sx={{
        position: 'fixed',
        top: 0,
        left: isSidebarOpen && isNonMobile ? '250px' : '0',
        right: 0,
        width: isSidebarOpen && isNonMobile ? `calc(100% - 250px)` : '100%',
        background: theme.palette.background.default,
        boxShadow: 'none',
        zIndex: 1300,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          padding: isMobileOrTablet ? '0.5rem' : '0.5rem 1rem',
          minHeight: '64px',
        }}
      >
        <FlexBetween
          sx={{ flex: searchOpen && isMobileOrTablet ? 1 : 'unset' }}
        >
          {!searchOpen ? (
            <IconButton
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              sx={{ mr: isMobileOrTablet ? 0 : 1 }}
            >
              <MenuIcon />
            </IconButton>
          ) : null}

          {searchOpen || !isMobileOrTablet ? (
            <FlexBetween
              borderRadius="9px"
              gap="0.5rem"
              p="0.1rem 1rem"
              sx={{
                height: '44px',
                backgroundColor: theme.palette.background.paper,
                flex: 1,
                maxWidth: isMobileOrTablet ? '100%' : '300px',
              }}
            >
              {isMobileOrTablet && searchOpen ? (
                <IconButton onClick={toggleSearch}>
                  <Close fontSize="small" />
                </IconButton>
              ) : null}
              <InputBase
                placeholder="Search..."
                sx={{
                  height: '100%',
                  flex: 1,
                  fontSize: '0.875rem',
                }}
                fullWidth
              />
              {!isMobileOrTablet ? (
                <IconButton size="small">
                  <Search fontSize="small" />
                </IconButton>
              ) : null}
            </FlexBetween>
          ) : (
            <IconButton onClick={toggleSearch}>
              <Search />
            </IconButton>
          )}
        </FlexBetween>

        {!searchOpen || !isMobileOrTablet ? (
          <FlexBetween
            gap={isMobileOrTablet ? '0.5rem' : '1.5rem'}
            sx={{ height: '44px', alignItems: 'center' }}
          >
            {!isMobileOrTablet ? (
              <IconButton onClick={() => dispatch(setMode())} size="small">
                {theme.palette.mode === 'dark' ? (
                  <DarkModeOutlined sx={{ fontSize: '22px' }} />
                ) : (
                  <LightModeOutlined sx={{ fontSize: '22px' }} />
                )}
              </IconButton>
            ) : null}

            {isLoggedIn ? (
              <>
                {!isMobileOrTablet ? (
                  <IconButton onClick={handleProfileClick} size="small">
                    <SettingsOutlined sx={{ fontSize: '22px' }} />
                  </IconButton>
                ) : null}

                <FlexBetween>
                  <Button
                    onClick={handleClick}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textTransform: 'none',
                      gap: '0.5rem',
                      minWidth: 'auto',
                      p: isMobileOrTablet ? '0.25rem' : '0.5rem',
                      height: '44px',
                    }}
                  >
                    {isMobileOrTablet ? (
                      <Box
                        component="img"
                        alt="profile"
                        src={profilePicture}
                        height="28px"
                        width="28px"
                        borderRadius="50%"
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <>
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
                            {name}
                          </Typography>
                        </Box>
                        <ArrowDropDownOutlined
                          sx={{
                            color: theme.palette.secondary[300],
                            fontSize: '22px',
                          }}
                        />
                      </>
                    )}
                  </Button>

                  <Menu
                    anchorEl={anchorEl}
                    open={isOpen}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'center',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                  >
                    {isMobileOrTablet ? (
                      <>
                        <MenuItem onClick={handleProfileClick}>
                          Profile
                        </MenuItem>
                        <MenuItem onClick={() => dispatch(setMode())}>
                          {theme.palette.mode === 'dark'
                            ? 'Light Mode'
                            : 'Dark Mode'}
                        </MenuItem>
                      </>
                    ) : null}
                    <MenuItem onClick={onChangePassword}>
                      Change Password
                    </MenuItem>
                    <MenuItem onClick={onLogoutClick}>Log Out</MenuItem>
                  </Menu>
                </FlexBetween>
              </>
            ) : (
              <Button
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textTransform: 'none',
                  gap: '0.5rem',
                  minWidth: 'auto',
                  p: isMobileOrTablet ? '0.25rem' : '0.5rem',
                }}
              >
                <Link
                  href="/login"
                  underline="hover"
                  sx={{
                    color: theme.palette.secondary[100],
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                  }}
                >
                  Log In
                </Link>
              </Button>
            )}
          </FlexBetween>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
