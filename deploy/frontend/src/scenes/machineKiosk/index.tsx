import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { themeSettings } from '@/theme';

import MachineKioskDetail from './MachineKioskDetail';

import axiosServer from '@/services/axios.service';
import { fetchProductionPlans } from '@/state/productionPlan/productionPlan.actions';
import { selectProductionPlans } from '@/state/productionPlan/productionPlan.selectors';
import { resetState } from '@/state/productionPlan/productionPlan.slice';
import { AppDispatch } from '@/state/store';

type KioskView = 'auth' | 'machines' | 'detail';

type KioskSession = {
  personId: string;
  personName: string;
  kioskToken: string;
  expiresAt: number;
};

type SelectedMachine = {
  id: string;
  name: string;
  number: number;
};

const lightTheme = createTheme(themeSettings('light'));

const SESSION_KEY = 'machineKioskSession';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const KIOSK_BG = '#0d1117';
const HEADER_BG = '#111827';
const whiteFieldSx = {
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.7)' },
    '&.Mui-focused fieldset': { borderColor: 'white' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
};

const loadSession = (): KioskSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as KioskSession;
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('token');
      return null;
    }
    localStorage.setItem('token', parsed.kioskToken);
    return parsed;
  } catch {
    return null;
  }
};

const saveSession = (session: KioskSession) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem('token', session.kioskToken);
};

const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('token');
};

const MachineKiosk = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const plans = useSelector(selectProductionPlans);

  const [view, setView] = useState<KioskView>(() =>
    loadSession() ? 'machines' : 'auth'
  );
  const [kioskToken, setKioskToken] = useState<string>(
    () => loadSession()?.kioskToken ?? ''
  );
  const [selectedMachine, setSelectedMachine] =
    useState<SelectedMachine | null>(null);

  const [authEmployee, setAuthEmployee] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [switchOpen, setSwitchOpen] = useState(false);
  const [switchEmployee, setSwitchEmployee] = useState('');
  const [switchPin, setSwitchPin] = useState('');
  const [switchLoading, setSwitchLoading] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleUnload = () => clearSession();
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, []);

  // Always active: log out when app goes to background, verify session on resume
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        clearSession();
        setView('auth');
        setSelectedMachine(null);
      } else if (!loadSession()) {
        // Safety net: iOS may suspend before setView('auth') commits — re-check on resume
        setView('auth');
        setSelectedMachine(null);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Wake lock: re-acquire after screen wakes, release when leaving kiosk
  useEffect(() => {
    if (view === 'auth') return;

    const acquireWakeLock = async () => {
      if (!('wakeLock' in navigator)) return;
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch {
        // device denied or not supported — silent fail
      }
    };

    const handleVisible = () => {
      if (document.visibilityState === 'visible') acquireWakeLock();
    };

    acquireWakeLock();
    document.addEventListener('visibilitychange', handleVisible);

    return () => {
      document.removeEventListener('visibilitychange', handleVisible);
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, [view]);

  useEffect(() => {
    if (view === 'machines' || view === 'detail') {
      dispatch(fetchProductionPlans({ page: 1, limit: 1000 }));
      pollRef.current = setInterval(() => {
        dispatch(fetchProductionPlans({ page: 1, limit: 1000 }));
      }, 10000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [view, dispatch]);

  useEffect(
    () => () => {
      dispatch(resetState());
      clearSession();
    },
    [dispatch]
  );

  const machineGroups = useMemo(() => {
    const acc: Record<
      string,
      {
        machineId: string;
        machineName: string;
        machineNumber: number;
        hasInProgress: boolean;
        inProgressItem: string | null;
        producedQty: number;
        totalQty: number;
      }
    > = {};
    for (const plan of plans) {
      if (!acc[plan.machineId]) {
        acc[plan.machineId] = {
          machineId: plan.machineId,
          machineName: plan.machineName ?? '',
          machineNumber: plan.machineNumber ?? 0,
          hasInProgress: false,
          inProgressItem: null,
          producedQty: 0,
          totalQty: 0,
        };
      }
      if (plan.status === 'in_progress') {
        acc[plan.machineId].hasInProgress = true;
        acc[plan.machineId].inProgressItem = plan.itemCode
          ? `${plan.itemCode} — ${plan.itemName ?? ''}`
          : null;
        acc[plan.machineId].producedQty = plan.producedQuantity ?? 0;
        acc[plan.machineId].totalQty = plan.quantity;
      }
    }
    return Object.values(acc).sort((a, b) => a.machineNumber - b.machineNumber);
  }, [plans]);

  const handleAuth = useCallback(async () => {
    if (!authEmployee.trim()) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await axiosServer.post('/machine-kiosk/verify-access', {
        employeeNumber: authEmployee.trim(),
        pin: authPin.trim(),
      });
      if (res.data.success) {
        const {
          personId,
          personName,
          kioskToken: newKioskToken,
        } = res.data.content as {
          personId: string;
          personName: string;
          kioskToken: string;
        };
        saveSession({
          personId,
          personName,
          kioskToken: newKioskToken,
          expiresAt: Date.now() + SESSION_TTL_MS,
        });
        setKioskToken(newKioskToken);
        setAuthEmployee('');
        setAuthPin('');
        setView('machines');
        return;
      }
      const { status } = res;
      if (status === 403) setAuthError(t('machineKiosk.auth.noPermission'));
      else if (status === 422)
        setAuthError(t('machineKiosk.auth.incorrectPin'));
      else if (status === 404) setAuthError(t('machineKiosk.auth.notFound'));
      else setAuthError(t('machineKiosk.auth.error'));
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? (err.response.data as { message: string }).message
          : t('machineKiosk.auth.error');
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  }, [authEmployee, authPin, t]);

  const handleSwitchSubmit = useCallback(async () => {
    if (!switchEmployee.trim()) return;
    setSwitchLoading(true);
    setSwitchError(null);
    try {
      const res = await axiosServer.post('/machine-kiosk/verify-access', {
        employeeNumber: switchEmployee.trim(),
        pin: switchPin.trim(),
      });
      if (res.data.success) {
        const {
          personId,
          personName,
          kioskToken: newKioskToken,
        } = res.data.content as {
          personId: string;
          personName: string;
          kioskToken: string;
        };
        saveSession({
          personId,
          personName,
          kioskToken: newKioskToken,
          expiresAt: Date.now() + SESSION_TTL_MS,
        });
        setKioskToken(newKioskToken);
        setSwitchOpen(false);
        setSwitchEmployee('');
        setSwitchPin('');
        setSwitchError(null);
        setSelectedMachine(null);
        setView('machines');
        return;
      }
      const { status } = res;
      if (status === 403) setSwitchError(t('machineKiosk.auth.noPermission'));
      else if (status === 422)
        setSwitchError(t('machineKiosk.auth.incorrectPin'));
      else if (status === 404) setSwitchError(t('machineKiosk.auth.notFound'));
      else setSwitchError(t('machineKiosk.auth.error'));
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? (err.response.data as { message: string }).message
          : t('machineKiosk.auth.error');
      setSwitchError(message);
    } finally {
      setSwitchLoading(false);
    }
  }, [switchEmployee, switchPin, t]);

  const openMachine = (machine: SelectedMachine) => {
    setSelectedMachine(machine);
    setView('detail');
  };

  if (view === 'auth') {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0d47a1',
          gap: 3,
          px: 3,
        }}
      >
        <PrecisionManufacturingIcon
          sx={{ fontSize: 64, color: 'white', opacity: 0.9 }}
        />
        <Typography
          variant="h4"
          fontWeight="bold"
          color="white"
          textAlign="center"
        >
          {t('machineKiosk.auth.title')}
        </Typography>
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          width="100%"
          maxWidth={360}
        >
          <TextField
            label={t('machineKiosk.auth.employeeNumber')}
            value={authEmployee}
            onChange={(e) => setAuthEmployee(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAuth();
            }}
            variant="outlined"
            fullWidth
            autoFocus
            sx={whiteFieldSx}
          />
          <TextField
            label={t('machineKiosk.auth.pin')}
            type="password"
            value={authPin}
            onChange={(e) => setAuthPin(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAuth();
            }}
            variant="outlined"
            fullWidth
            inputProps={{ maxLength: 4 }}
            sx={whiteFieldSx}
          />
          {authError && (
            <Alert severity="error" sx={{ borderRadius: 1 }}>
              {authError}
            </Alert>
          )}
          <Button
            variant="contained"
            size="large"
            onClick={handleAuth}
            disabled={authLoading || !authEmployee}
            sx={{
              bgcolor: 'white',
              color: '#0d47a1',
              fontWeight: 'bold',
              py: 1.5,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              '&.Mui-disabled': {
                bgcolor: 'rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.6)',
              },
            }}
          >
            {authLoading ? (
              <CircularProgress size={22} sx={{ color: '#0d47a1' }} />
            ) : (
              t('machineKiosk.auth.enter')
            )}
          </Button>
        </Box>
      </Box>
    );
  }

  if (view === 'machines') {
    return (
      <Box
        sx={{
          width: '100vw',
          minHeight: '100vh',
          backgroundColor: KIOSK_BG,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            backgroundColor: HEADER_BG,
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <PrecisionManufacturingIcon
            sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 28 }}
          />
          <Typography variant="h5" fontWeight="bold" color="white">
            {t('machineKiosk.machines.title')}
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                clearSession();
                setView('auth');
              }}
              sx={{
                color: 'rgba(255,255,255,0.6)',
                borderColor: 'rgba(255,255,255,0.2)',
                '&:hover': { borderColor: 'rgba(255,255,255,0.5)' },
              }}
            >
              {t('machineKiosk.machines.logout')}
            </Button>
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1 }}>
          {machineGroups.length === 0 ? (
            <Typography color="rgba(255,255,255,0.4)" textAlign="center" mt={6}>
              {t('machineKiosk.machines.empty')}
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr 1fr',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                  lg: 'repeat(5, 1fr)',
                },
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              {machineGroups.map((m) => {
                const progressPct =
                  m.totalQty > 0
                    ? Math.min((m.producedQty / m.totalQty) * 100, 100)
                    : 0;
                return (
                  <Card
                    key={m.machineId}
                    sx={{
                      backgroundColor: m.hasInProgress ? '#1a2744' : '#1c1f26',
                      border: m.hasInProgress
                        ? '1px solid #f59e0b'
                        : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 2,
                    }}
                  >
                    <CardActionArea
                      onClick={() =>
                        openMachine({
                          id: m.machineId,
                          name: m.machineName,
                          number: m.machineNumber,
                        })
                      }
                      sx={{ p: 2 }}
                    >
                      <CardContent sx={{ p: 0 }}>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="white"
                        >
                          #{m.machineNumber}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="rgba(255,255,255,0.7)"
                          noWrap
                          mb={1.5}
                        >
                          {m.machineName}
                        </Typography>
                        {m.hasInProgress ? (
                          <>
                            <Chip
                              label={t('productionPlan.status.in_progress')}
                              color="warning"
                              size="small"
                              sx={{ mb: 1 }}
                            />
                            {m.inProgressItem && (
                              <Typography
                                variant="caption"
                                color="rgba(255,255,255,0.55)"
                                display="block"
                                noWrap
                                mb={0.75}
                              >
                                {m.inProgressItem}
                              </Typography>
                            )}
                            <LinearProgress
                              variant="determinate"
                              value={progressPct}
                              color="warning"
                              sx={{
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="rgba(255,255,255,0.4)"
                              display="block"
                              mt={0.5}
                            >
                              {m.producedQty.toLocaleString()} /{' '}
                              {m.totalQty.toLocaleString()}
                            </Typography>
                          </>
                        ) : (
                          <Chip
                            label={t('machineKiosk.machines.idle')}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              color: 'rgba(255,255,255,0.5)',
                            }}
                          />
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  if (view === 'detail' && selectedMachine) {
    return (
      <>
        <Box
          sx={{
            width: '100vw',
            height: '100vh',
            backgroundColor: KIOSK_BG,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              backgroundColor: HEADER_BG,
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              flexShrink: 0,
            }}
          >
            <PrecisionManufacturingIcon
              sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 28 }}
            />
            <Box flexGrow={1} minWidth={0}>
              <Typography variant="h5" fontWeight="bold" color="white" noWrap>
                #{selectedMachine.number} — {selectedMachine.name}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={() => setSwitchOpen(true)}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                borderColor: 'rgba(255,255,255,0.3)',
                whiteSpace: 'nowrap',
                '&:hover': { borderColor: 'white', color: 'white' },
              }}
            >
              {t('machineKiosk.detail.switchMachine')}
            </Button>
          </Box>

          <ThemeProvider theme={lightTheme}>
            <Box
              sx={{
                flexGrow: 1,
                minHeight: 0,
                overflowY: 'auto',
                backgroundColor: 'background.default',
              }}
            >
              <MachineKioskDetail
                machineId={selectedMachine.id}
                kioskToken={kioskToken}
              />
            </Box>
          </ThemeProvider>
        </Box>

        <Dialog
          open={switchOpen}
          onClose={() => {
            setSwitchOpen(false);
            setSwitchEmployee('');
            setSwitchPin('');
            setSwitchError(null);
          }}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { backgroundColor: '#1c2333', backgroundImage: 'none' },
          }}
        >
          <DialogTitle sx={{ color: 'white' }}>
            {t('machineKiosk.switch.title')}
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={0.5}>
              <TextField
                label={t('machineKiosk.auth.employeeNumber')}
                value={switchEmployee}
                onChange={(e) => setSwitchEmployee(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSwitchSubmit();
                }}
                variant="outlined"
                fullWidth
                autoFocus
                sx={whiteFieldSx}
              />
              <TextField
                label={t('machineKiosk.auth.pin')}
                type="password"
                value={switchPin}
                onChange={(e) => setSwitchPin(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSwitchSubmit();
                }}
                variant="outlined"
                fullWidth
                inputProps={{ maxLength: 4 }}
                sx={whiteFieldSx}
              />
              {switchError && <Alert severity="error">{switchError}</Alert>}
              <Box display="flex" gap={1} justifyContent="flex-end" mt={0.5}>
                <Button
                  onClick={() => {
                    setSwitchOpen(false);
                    setSwitchEmployee('');
                    setSwitchPin('');
                    setSwitchError(null);
                  }}
                  sx={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSwitchSubmit}
                  disabled={switchLoading || !switchEmployee}
                >
                  {switchLoading ? (
                    <CircularProgress size={18} />
                  ) : (
                    t('machineKiosk.switch.confirm')
                  )}
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return null;
};

export default MachineKiosk;
