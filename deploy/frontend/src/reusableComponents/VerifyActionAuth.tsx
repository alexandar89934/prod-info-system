import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AxiosError } from 'axios';
import axiosServer from '@/services/axios.service';
import { ProductionPlanActionType } from '@/state/productionPlanAction/productionPlanAction.types';

export type VerifiedPerson = { personId: string; personName: string };

type Props = {
  actionType: ProductionPlanActionType;
  verifiedPerson: VerifiedPerson | null;
  onVerified: (person: VerifiedPerson) => void;
  onReset: () => void;
};

const VerifyActionAuth = ({ actionType, verifiedPerson, onVerified, onReset }: Props) => {
  const { t } = useTranslation();
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!employeeNumber) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axiosServer.post('/production-plan-action/verify-permission', {
        employeeNumber,
        pin,
        actionType,
      });
      if (res.data.success) {
        onVerified(res.data.content as VerifiedPerson);
        return;
      }
      const { status } = res;
      if (status === 403) {
        setError(
          `${t('productionPlan.actions.noPermission')}: ${t(`productionPlan.actions.types.${actionType}`)}`
        );
      } else if (status === 422) {
        setError(t('productionPlan.actions.incorrectPin'));
      } else if (status === 404) {
        setError(t('productionPlan.actions.employeeNotFound'));
      } else {
        const d = res.data as { error?: { message?: string }; message?: string };
        setError(d.error?.message ?? d.message ?? t('productionPlan.actions.verifyFailed'));
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
      setError(
        axiosErr?.response?.data?.error?.message ?? t('productionPlan.actions.verifyFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmployeeNumber('');
    setPin('');
    setError(null);
    onReset();
  };

  if (verifiedPerson) {
    return (
      <Box display="flex" alignItems="center" gap={1} sx={{ color: 'success.main' }}>
        <CheckCircleIcon sx={{ fontSize: 16 }} />
        <Typography variant="body2" fontWeight={700}>{verifiedPerson.personName}</Typography>
        <Button size="small" variant="text" sx={{ ml: 'auto' }} onClick={handleReset}>
          {t('productionPlan.actions.reVerify')}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" gap={1} alignItems="flex-start" flexWrap="wrap">
        <TextField
          label={t('productionPlan.actions.employeeNumber')}
          size="small"
          value={employeeNumber}
          onChange={(e) => setEmployeeNumber(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
          sx={{ width: 160 }}
        />
        <TextField
          label={t('productionPlan.actions.pin')}
          type="password"
          size="small"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
          sx={{ width: 130 }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={handleVerify}
          disabled={loading || !employeeNumber}
          sx={{ alignSelf: 'center' }}
        >
          {loading ? <CircularProgress size={16} /> : t('productionPlan.actions.verify')}
        </Button>
      </Box>
      {error && (
        <Typography variant="caption" color="error" display="block" mt={0.5}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default VerifyActionAuth;