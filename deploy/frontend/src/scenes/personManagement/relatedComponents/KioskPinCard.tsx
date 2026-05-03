import { Alert, Box, Button, CircularProgress, TextField, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import axiosServer from '@/services/axios.service.ts';

const KioskPinCard = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError(t('profile.kioskPin.errorFormat'));
      return;
    }
    if (pin !== confirmPin) {
      setError(t('profile.kioskPin.errorMismatch'));
      return;
    }

    setLoading(true);
    try {
      const response = await axiosServer.put('/auth/user/set-pin', { pin, confirmPin });
      if (response.data.success) {
        setSuccess(t('profile.kioskPin.success'));
        setPin('');
        setConfirmPin('');
      } else {
        setError(response.data.message || t('profile.kioskPin.errorGeneric'));
      }
    } catch {
      setError(t('profile.kioskPin.errorGeneric'));
    } finally {
      setLoading(false);
      setTimeout(() => { setSuccess(null); setError(null); }, 3000);
    }
  };

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: 3,
        mt: 3,
        maxWidth: 400,
      }}
    >
      <Typography variant="h6" mb={2}>{t('profile.kioskPin.title')}</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {t('profile.kioskPin.description')}
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        fullWidth
        label={t('profile.kioskPin.newPin')}
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
        inputProps={{ maxLength: 4, inputMode: 'numeric' }}
        margin="normal"
      />
      <TextField
        fullWidth
        label={t('profile.kioskPin.confirmPin')}
        type="password"
        value={confirmPin}
        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
        inputProps={{ maxLength: 4, inputMode: 'numeric' }}
        margin="normal"
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
      />

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleSubmit}
        disabled={loading || pin.length < 4 || confirmPin.length < 4}
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {loading ? t('profile.kioskPin.saving') : t('profile.kioskPin.save')}
      </Button>
    </Box>
  );
};

export default KioskPinCard;