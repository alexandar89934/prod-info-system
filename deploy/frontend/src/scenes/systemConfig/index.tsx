import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Header from '@/reusableComponents/Header';
import { AppDispatch } from '@/state/store.ts';
import {
  fetchSystemConfigs,
  updateSystemConfig,
} from '@/state/systemConfig/systemConfig.actions.ts';
import {
  selectSystemConfigError,
  selectSystemConfigLoading,
  selectSystemConfigs,
  selectSystemConfigSuccess,
  selectSystemConfigUpdateLoading,
} from '@/state/systemConfig/systemConfig.selectors.ts';
import {
  clearError,
  clearSuccess,
} from '@/state/systemConfig/systemConfig.slice.ts';
import { SystemConfig } from '@/state/systemConfig/systemConfig.types.ts';

const SystemConfigPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const configs = useSelector(selectSystemConfigs);
  const loading = useSelector(selectSystemConfigLoading);
  const updateLoading = useSelector(selectSystemConfigUpdateLoading);
  const error = useSelector(selectSystemConfigError);
  const success = useSelector(selectSystemConfigSuccess);

  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    dispatch(fetchSystemConfigs());
  }, [dispatch]);

  useEffect(() => {
    if (configs.length > 0) {
      const initial: Record<string, string> = {};
      configs.forEach((c) => {
        initial[c.key] = c.value;
      });
      setEditValues(initial);
    }
  }, [configs]);

  useEffect(() => {
    if (success) {
      setNotification({
        message: t('systemConfig.saveSuccess'),
        type: 'success',
      });
      setSavingKey(null);
      setTimeout(() => dispatch(clearSuccess()), 3000);
    }
    if (error) {
      setNotification({ message: t('systemConfig.saveError'), type: 'error' });
      setSavingKey(null);
      setTimeout(() => dispatch(clearError()), 3000);
    }
  }, [success, error, dispatch, t]);

  const handleSave = (config: SystemConfig) => {
    setSavingKey(config.key);
    dispatch(
      updateSystemConfig({
        key: config.key,
        value: editValues[config.key] ?? config.value,
      })
    );
  };

  const getLabel = (key: string): string => {
    const translationKey = `systemConfig.keys.${key}`;
    const translated = t(translationKey);
    return translated === translationKey ? key : translated;
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, pt: { xs: 1, sm: 2 }, pb: 1 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Header
          title={t('systemConfig.title')}
          subtitle={t('systemConfig.subtitle')}
        />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <Box display="flex" flexDirection="column" gap={2} maxWidth={600}>
          {configs.map((config) => (
            <Paper
              key={config.key}
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                {getLabel(config.key)}
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <TextField
                  value={editValues[config.key] ?? config.value}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      [config.key]: e.target.value,
                    }))
                  }
                  size="small"
                  sx={{ width: 160 }}
                  inputProps={{ inputMode: 'decimal' }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleSave(config)}
                  disabled={
                    updateLoading || editValues[config.key] === config.value
                  }
                  sx={{ minWidth: 100 }}
                >
                  {savingKey === config.key && updateLoading
                    ? t('systemConfig.saving')
                    : t('systemConfig.save')}
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity={notification?.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemConfigPage;
