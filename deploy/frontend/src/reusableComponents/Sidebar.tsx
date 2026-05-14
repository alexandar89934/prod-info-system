import {
  ChevronLeft,
  ChevronRightOutlined,
  HomeOutlined,
  Groups2Outlined,
  ReceiptLongOutlined,
  CategoryOutlined,
  CheckCircleOutline,
  PieChartOutlined,
  AdminPanelSettingsOutlined,
  PrecisionManufacturingOutlined,
  AssignmentOutlined,
  AccessTimeOutlined,
  TuneOutlined,
  ViewInArOutlined,
  InventoryOutlined,
  BusinessOutlined,
  ListAltOutlined,
  EventNoteOutlined,
  PlayCircleOutlined,
} from '@mui/icons-material';
import {
  Box,
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
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { getIsLoggedIn } from '@/state/auth/auth.selectors.ts';

type NavItem = {
  textKey: string;
  path: string | null;
  icon: React.ReactNode | null;
  requiresAuth?: boolean;
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
  { textKey: 'sidebar.dashboard', path: 'dashboard', icon: <HomeOutlined />, requiresAuth: false },
  { textKey: 'sidebar.companyManagement', path: null, icon: null, requiresAuth: true },
  { textKey: 'sidebar.companies', path: 'company', icon: <BusinessOutlined />, requiresAuth: true },
  { textKey: 'sidebar.personManagement', path: null, icon: null, requiresAuth: true },
  { textKey: 'sidebar.persons', path: 'person', icon: <Groups2Outlined />, requiresAuth: true },
  { textKey: 'sidebar.jobPositions', path: 'jobPosition', icon: <ReceiptLongOutlined />, requiresAuth: true },
  { textKey: 'sidebar.jobPositionCategories', path: 'jobPositionCategories', icon: <CategoryOutlined />, requiresAuth: true },
  { textKey: 'sidebar.responsibilities', path: 'responsibilities', icon: <AssignmentOutlined />, requiresAuth: true },
  { textKey: 'sidebar.attendanceManagement', path: null, icon: null, requiresAuth: true },
  { textKey: 'sidebar.attendance', path: 'attendance', icon: <AccessTimeOutlined />, requiresAuth: true },
  { textKey: 'sidebar.systemConfig', path: 'system-config', icon: <TuneOutlined />, requiresAuth: true },
  { textKey: 'sidebar.machineManagement', path: null, icon: null, requiresAuth: true },
  {
    textKey: 'sidebar.availabilityStatuses',
    path: 'machineAvailabilityStatus',
    icon: <CheckCircleOutline />,
    requiresAuth: true,
  },
  {
    textKey: 'sidebar.equipmentTypes',
    path: 'machineEquipmentTypes',
    icon: <PieChartOutlined />,
    requiresAuth: true,
  },
  {
    textKey: 'sidebar.equipment',
    path: 'machineEquipment',
    icon: <AdminPanelSettingsOutlined />,
    requiresAuth: true,
  },
  {
    textKey: 'sidebar.machines',
    path: 'machine',
    icon: <PrecisionManufacturingOutlined />,
    requiresAuth: true,
  },
  { textKey: 'sidebar.moldManagement', path: null, icon: null, requiresAuth: true },
  {
    textKey: 'sidebar.molds',
    path: 'mold',
    icon: <ViewInArOutlined />,
    requiresAuth: true,
  },
  { textKey: 'sidebar.itemManagement', path: null, icon: null, requiresAuth: true },
  {
    textKey: 'sidebar.items',
    path: 'item',
    icon: <InventoryOutlined />,
    requiresAuth: true,
  },
  {
    textKey: 'sidebar.packagingUnits',
    path: 'packaging-unit',
    icon: <CategoryOutlined />,
    requiresAuth: true,
  },
  { textKey: 'sidebar.orderManagement', path: null, icon: null, requiresAuth: true },
  { textKey: 'sidebar.customerOrders', path: 'customer-order', icon: <ListAltOutlined />, requiresAuth: true },
  { textKey: 'sidebar.productionPlan', path: 'production-plan', icon: <EventNoteOutlined />, requiresAuth: true },
  { textKey: 'sidebar.productionView', path: 'production-view', icon: <PlayCircleOutlined />, requiresAuth: true },
];

const Sidebar: React.FC<SidebarProps> = ({
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
}) => {
  const { pathname } = useLocation();
  const [active, setActive] = useState<string>('');
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const isLoggedIn: boolean = useSelector(getIsLoggedIn);

  const visibleItems = navItems.reduce<NavItem[]>((acc, item, index) => {
    if (item.requiresAuth && !isLoggedIn) return acc;
    if (!item.icon) {
      const nextItems = navItems.slice(index + 1);
      const nextHeader = nextItems.findIndex((i) => !i.icon);
      const sectionItems = nextHeader === -1 ? nextItems : nextItems.slice(0, nextHeader);
      const hasSectionVisible = sectionItems.some((i) => !i.requiresAuth || isLoggedIn);
      if (!hasSectionVisible) return acc;
    }
    return [...acc, item];
  }, []);


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
            '&::-webkit-scrollbar': { width: '8px' },
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
          {!isNonMobile && (
            <Box display="flex" justifyContent="flex-end" p="0.75rem 0.5rem 0">
              <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <ChevronLeft />
              </IconButton>
            </Box>
          )}

          <Box flexGrow={1}>
            <List>
              {visibleItems.map(({ textKey, path, icon }) => {
                if (!icon) {
                  return (
                    <Typography key={textKey} sx={{ m: '1.5rem 0 0.5rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6 }}>
                      {t(textKey)}
                    </Typography>
                  );
                }
                return (
                  <ListItem key={textKey} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(`/${path}`);
                        setActive(path!);
                        if (!isNonMobile) {
                          setIsSidebarOpen(false);
                        }
                      }}
                      sx={{
                        backgroundColor:
                          active === path
                            ? theme.palette.secondary[300]
                            : 'transparent',
                        color:
                          active === path
                            ? theme.palette.primary[600]
                            : theme.palette.secondary[100],
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color:
                            active === path
                              ? theme.palette.primary[600]
                              : theme.palette.secondary[200],
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText primary={t(textKey)} />
                      {active === path ? (
                        <ChevronRightOutlined sx={{ ml: 'auto' }} />
                      ) : null}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

        </Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;