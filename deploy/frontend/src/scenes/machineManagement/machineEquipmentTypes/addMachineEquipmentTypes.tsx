import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, Alert, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { Controller, FieldError, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Header from '@/reusableComponents/Header';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import { getName } from '@/state/auth/auth.selectors.ts';
import { useAppDispatch } from '@/state/hooks';
import { addMachineEquipmentType } from '@/state/machineEquipmentTypes/machineEquipmentTypes.actions.ts';
import {
  selectMachineEquipmentTypeLoading as selectLoading,
  selectMachineEquipmentTypeError as selectError,
  selectMachineEquipmentTypeSuccess as selectSuccess,
} from '@/state/machineEquipmentTypes/machineEquipmentTypes.selectors.ts';
import {
  clearError,
  clearSuccess,
} from '@/state/machineEquipmentTypes/machineEquipmentTypes.slice.ts';
import { AddMachineEquipmentTypeFormData } from '@/state/machineEquipmentTypes/machineEquipmentTypes.types.ts';
import { machineEquipmentTypeSchema } from '@/zodValidationSchemas/machineEquipmentType.schema.ts';

const AddMachineEquipmentType = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const success = useSelector(selectSuccess);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMachineEquipmentTypeFormData>({
    resolver: zodResolver(machineEquipmentTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      createdBy: getName(),
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearError());
      dispatch(clearSuccess());
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, success, dispatch]);

  const onSubmit = async (data: AddMachineEquipmentTypeFormData) => {
    try {
      await dispatch(addMachineEquipmentType(data)).unwrap();
      reset();
      navigate('/machineEquipmentTypes');
    } catch (err) {
      console.error(err);
    }
  };

  const onCancel = () => {
    reset();
    navigate('/machineEquipmentTypes');
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
      sx={{ p: 2, overflow: 'hidden' }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        width="100%"
        maxWidth="750px"
        p={3}
        border="1px solid"
        borderColor="grey.300"
        borderRadius={2}
        boxShadow={1}
        sx={{
          backgroundColor: theme.palette.background.default,
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header title={t('machineEquipmentType.form.addTitle')} subtitle="" />
        <Box sx={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', display: 'flex', flexDirection: 'column', gap: 2, pb: 2, '&::-webkit-scrollbar': { width: 8 }, '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.primary.main, borderRadius: 4 }, '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.background.default } }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <LabeledXtField
                id="name"
                label={t('machineEquipmentType.form.name')}
                error={errors.name as FieldError}
                {...field}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <LabeledXtField
                id="description"
                label={t('machineEquipmentType.form.description')}
                multiline
                rows={4}
                error={errors.description as FieldError}
                {...field}
              />
            )}
          />
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            pt: 2,
            pb: 2,
            px: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: theme.palette.background.default,
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
              {success}
            </Alert>
          )}
          <Box display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : undefined}
            >
              {loading ? t('machineEquipmentType.form.addSubmitLoading') : t('machineEquipmentType.form.addSubmit')}
            </Button>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
              sx={{
                color: theme.palette.primary[100],
                borderColor: theme.palette.primary[100],
                '&:hover': {
                  borderColor: theme.palette.primary[200],
                  backgroundColor: theme.palette.primary[100],
                  color: theme.palette.common.white,
                },
              }}
            >
              {t('machineEquipmentType.form.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddMachineEquipmentType;