import {
  LightModeOutlined,
  DarkModeOutlined,
  Menu as MenuIcon,
  Search,
  SettingsOutlined,
  ArrowDropDownOutlined,
  Close,
  NotificationsOutlined,
} from '@mui/icons-material';
import {
  AppBar,
  Badge,
  Button,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Popover,
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
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const isMobile = !isNonMobile;
  const isMobileOrTablet = isMobile || isTablet;

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'sr' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('language', next);
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [readNotifs, setReadNotifs] = useState<Set<number>>(new Set());

  const notifications = [
    { id: 1, message: 'New production plan added for next shift.' },
    { id: 2, message: 'Your leave request has been approved.' },
    { id: 3, message: 'You are assigned to machine #16 on your upcoming shift.' },
    { id: 4, message: 'Working on plan #123455 — producing LEČA VRAT 6N.' },
    { id: 5, message: 'Tool mounting confirmed on machine #16 by regler.' },
  ];
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
                placeholder={t('navbar.search')}
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

        {!searchOpen && (
          <Typography
            fontWeight="bold"
            sx={{
              color: theme.palette.secondary[100],
              userSelect: 'none',
              whiteSpace: 'nowrap',
              fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.35rem' },
            }}
          >
            Production Info System
          </Typography>
        )}

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

            <IconButton
              size="small"
              onClick={(e) => setNotifAnchor(e.currentTarget)}
            >
              <Badge
                badgeContent={notifications.length - readNotifs.size}
                color="error"
                max={99}
              >
                <NotificationsOutlined sx={{ fontSize: '22px' }} />
              </Badge>
            </IconButton>

            <Button
              size="small"
              onClick={toggleLanguage}
              sx={{
                minWidth: 'auto',
                px: 1,
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: 'bold',
                color: theme.palette.secondary[100],
                border: `1px solid ${theme.palette.secondary[300]}`,
                borderRadius: 1,
              }}
            >
              {i18n.language === 'en' ? 'SR' : 'EN'}
            </Button>

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
                          {t('navbar.profile')}
                        </MenuItem>
                        <MenuItem onClick={() => dispatch(setMode())}>
                          {theme.palette.mode === 'dark'
                            ? t('navbar.lightMode')
                            : t('navbar.darkMode')}
                        </MenuItem>
                      </>
                    ) : null}
                    <MenuItem onClick={onChangePassword}>
                      {t('navbar.changePassword')}
                    </MenuItem>
                    <MenuItem onClick={onLogoutClick}>{t('navbar.logout')}</MenuItem>
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
                  {t('navbar.login')}
                </Link>
              </Button>
            )}
          </FlexBetween>
        ) : null}
      </Toolbar>
      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={() => setNotifAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 340, maxHeight: 420, display: 'flex', flexDirection: 'column' } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {t('navbar.notifications')}
          </Typography>
          {readNotifs.size < notifications.length && (
            <Typography
              variant="caption"
              sx={{ cursor: 'pointer', color: theme.palette.primary.main }}
              onClick={() => setReadNotifs(new Set(notifications.map((n) => n.id)))}
            >
              {t('navbar.markAllRead')}
            </Typography>
          )}
        </Box>
        <Divider />
        <List disablePadding sx={{ overflowY: 'auto' }}>
          {notifications.map((n, idx) => {
            const isRead = readNotifs.has(n.id);
            return (
              <ListItem
                key={n.id}
                alignItems="flex-start"
                divider={idx < notifications.length - 1}
                onClick={() => setReadNotifs((prev) => new Set(Array.from(prev).concat(n.id)))}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: isRead ? 'transparent' : theme.palette.action.hover,
                  '&:hover': { backgroundColor: theme.palette.action.selected },
                  gap: 1,
                }}
              >
                {!isRead && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.error.main,
                      flexShrink: 0,
                      mt: 0.75,
                    }}
                  />
                )}
                <ListItemText
                  primary={n.message}
                  primaryTypographyProps={{ variant: 'body2', color: isRead ? 'text.secondary' : 'text.primary' }}
                  sx={{ ml: isRead ? '16px' : 0 }}
                />
              </ListItem>
            );
          })}
        </List>
      </Popover>
    </AppBar>
  );
};

export default Navbar;
