import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import axiosServer from '@/services/axios.service.ts';
import {
  KioskResult,
  KioskStatus,
} from '@/state/attendance/attendance.types.ts';

type KioskMode = 'rfid' | 'pin';

const DISPLAY_DURATION_MS = 3000;
const KIOSK_BG = '#0d47a1';

const statusColors: Record<KioskStatus | 'error', string> = {
  checked_in: '#2e7d32',
  checked_out: '#1565c0',
  break_started: '#e65100',
  returned_from_break: '#2e7d32',
  choice_required: KIOSK_BG,
  auto_closed_and_checked_in: '#e65100',
  error: '#b71c1c',
};

const whiteFieldSx = {
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
    '&:hover fieldset': { borderColor: 'white' },
    '&.Mui-focused fieldset': { borderColor: 'white' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
};

const Kiosk = () => {
  const { t } = useTranslation();
  const rfidInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<KioskMode>('rfid');
  const [rfidBuffer, setRfidBuffer] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KioskResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [breakMode, setBreakMode] = useState(false);

  const reset = useCallback(() => {
    setResult(null);
    setErrorMsg(null);
    setRfidBuffer('');
    setEmployeeNumber('');
    setPin('');
    setBreakMode(false);
    setMode('rfid');
    rfidInputRef.current?.focus();
  }, []);

  const resetAfterDelay = useCallback(() => {
    setTimeout(reset, DISPLAY_DURATION_MS);
  }, [reset]);

  useEffect(() => {
    rfidInputRef.current?.focus();
  }, [mode, result]);

  const callKiosk = useCallback(
    async (payload: Record<string, string>) => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const response = await axiosServer.post('/attendance/kiosk', payload);
        if (response.data.success) {
          const data = response.data.content as KioskResult;
          setResult(data);
          resetAfterDelay();
        } else {
          setErrorMsg(response.data.message || t('kiosk.error.unknown'));
          resetAfterDelay();
        }
      } catch (err: unknown) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? (err.response.data as { message: string }).message
            : t('kiosk.error.unknown');
        setErrorMsg(message);
        resetAfterDelay();
      } finally {
        setLoading(false);
      }
    },
    [resetAfterDelay, t]
  );

  const handleRfidKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && rfidBuffer.trim()) {
        callKiosk({
          rfidCardNumber: rfidBuffer.trim(),
          action: breakMode ? 'break' : 'checkout',
        });
      }
    },
    [rfidBuffer, breakMode, callKiosk]
  );

  const handlePinSubmit = useCallback(() => {
    if (employeeNumber.trim() && pin.trim()) {
      callKiosk({
        employeeNumber: employeeNumber.trim(),
        pin: pin.trim(),
        action: breakMode ? 'break' : 'checkout',
      });
    }
  }, [employeeNumber, pin, breakMode, callKiosk]);

  const isError = !!errorMsg;
  const getBackground = (): string => {
    if (isError) return statusColors.error;
    if (result) return statusColors[result.status] ?? KIOSK_BG;
    return KIOSK_BG;
  };
  const bgColor = getBackground();

  const getStatusLabel = (status: KioskStatus): string => {
    const map: Record<KioskStatus, string> = {
      checked_in: t('kiosk.checkedIn'),
      checked_out: t('kiosk.checkedOut'),
      break_started: t('kiosk.breakStarted'),
      returned_from_break: t('kiosk.returnedFromBreak'),
      choice_required: '',
      auto_closed_and_checked_in: t('kiosk.autoClosedAndCheckedIn'),
    };
    return map[status] ?? '';
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        transition: 'background-color 0.4s ease',
        px: 3,
        gap: 3,
        position: 'relative',
      }}
    >
      {loading && <CircularProgress size={60} sx={{ color: 'white' }} />}

      {!loading && result && (
        <Box textAlign="center">
          <Typography variant="h3" fontWeight="bold" color="white">
            {getStatusLabel(result.status)}
          </Typography>
          <Typography variant="h4" color="white" mt={1}>
            {result.personName}
          </Typography>
          {result.time && (
            <Typography variant="h6" color="white" mt={1}>
              {new Date(result.time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          )}
        </Box>
      )}

      {!loading && isError && (
        <Box textAlign="center">
          <Typography variant="h4" fontWeight="bold" color="white">
            {t('kiosk.error.title')}
          </Typography>
          <Typography variant="h5" color="white" mt={1}>
            {errorMsg}
          </Typography>
        </Box>
      )}

      {!loading && !result && !errorMsg && (
        <>
          {breakMode && (
            <Box
              sx={{
                position: 'absolute',
                top: 24,
                background: '#e65100',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              <Typography
                variant="h6"
                color="white"
                fontWeight="bold"
                textAlign="center"
              >
                {t('kiosk.breakModeActive')}
              </Typography>
            </Box>
          )}

          <Typography
            variant="h4"
            fontWeight="bold"
            color="white"
            textAlign="center"
          >
            {t('kiosk.scanPrompt')}
          </Typography>

          {mode === 'rfid' && (
            <TextField
              inputRef={rfidInputRef}
              value={rfidBuffer}
              onChange={(e) => setRfidBuffer(e.target.value)}
              onKeyDown={handleRfidKeyDown}
              autoFocus
              sx={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
              inputProps={{ 'aria-label': 'rfid-input' }}
            />
          )}

          {mode === 'pin' && (
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              width="100%"
              maxWidth={340}
            >
              <TextField
                label={t('kiosk.employeeNumber')}
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                variant="outlined"
                fullWidth
                autoFocus
                sx={whiteFieldSx}
              />
              <TextField
                label={t('kiosk.pin')}
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                variant="outlined"
                fullWidth
                inputProps={{ maxLength: 4 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePinSubmit();
                }}
                sx={whiteFieldSx}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handlePinSubmit}
                disabled={!employeeNumber || pin.length < 4}
                sx={{
                  bgcolor: 'white',
                  color: KIOSK_BG,
                  fontWeight: 'bold',
                  py: 1.5,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                    color: 'rgba(255,255,255,0.6)',
                  },
                }}
              >
                {t('kiosk.confirm')}
              </Button>
            </Box>
          )}

          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            mt={1}
          >
            <Button
              variant={breakMode ? 'contained' : 'outlined'}
              size="large"
              onClick={() => setBreakMode(!breakMode)}
              sx={{
                minWidth: 220,
                py: 2,
                fontSize: '1rem',
                fontWeight: 'bold',
                ...(breakMode
                  ? {
                      bgcolor: '#e65100',
                      color: 'white',
                      borderColor: '#e65100',
                      '&:hover': { bgcolor: '#bf360c' },
                    }
                  : {
                      borderColor: '#ff9800',
                      color: '#ff9800',
                      '&:hover': {
                        borderColor: '#ff9800',
                        bgcolor: 'rgba(255,152,0,0.1)',
                      },
                    }),
              }}
            >
              {t('kiosk.goOnBreak')}
            </Button>

            <Button
              variant="text"
              onClick={() => setMode(mode === 'rfid' ? 'pin' : 'rfid')}
              sx={{
                color: 'rgba(255,255,255,0.75)',
                '&:hover': { color: 'white' },
              }}
            >
              {mode === 'rfid'
                ? t('kiosk.switchToPin')
                : t('kiosk.switchToRfid')}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Kiosk;
