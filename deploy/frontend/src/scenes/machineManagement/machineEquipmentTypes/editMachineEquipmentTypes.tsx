import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, Alert, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { Controller, FieldError, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/reusableComponents/Header';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import { getName } from '@/state/auth/auth.selectors';
import { useAppDispatch } from '@/state/hooks';
import {
  fetchMachineEquipmentTypeById,
  updateMachineEquipmentType,
} from '@/state/machineEquipmentTypes/machineEquipmentTypes.actions';
import {
  selectCurrentMachineEquipmentType,
  selectMachineEquipmentTypeLoading as selectLoading,
  selectMachineEquipmentTypeError as selectError,
  selectMachineEquipmentTypeSuccess as selectSuccess,
} from '@/state/machineEquipmentTypes/machineEquipmentTypes.selectors';
import {
  clearError,
  clearSuccess,
} from '@/state/machineEquipmentTypes/machineEquipmentTypes.slice';
import { EditMachineEquipmentTypeFormData } from '@/state/machineEquipmentTypes/machineEquipmentTypes.types';
import { machineEquipmentTypeSchema } from '@/zodValidationSchemas/machineEquipmentType.schema';

const EditMachineEquipmentType = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const success = useSelector(selectSuccess);
  const equipmentType = useSelector(selectCurrentMachineEquipmentType);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditMachineEquipmentTypeFormData>({
    resolver: zodResolver(machineEquipmentTypeSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchMachineEquipmentTypeById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (equipmentType?.name) {
      reset({
        id: Number(equipmentType.id),
        name: equipmentType.name,
        description: equipmentType.description ?? '',
        updatedBy: getName(),
      });
    }
  }, [equipmentType, reset]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearError());
      dispatch(clearSuccess());
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, success, dispatch]);

  const onSubmit = async (data: EditMachineEquipmentTypeFormData) => {
    await dispatch(updateMachineEquipmentType(data)).unwrap();
    navigate('/machineEquipmentTypes');
  };

  const onCancel = () => {
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
        maxWidth="600px"
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
        <Header title={t('machineEquipmentType.form.editTitle')} subtitle="" />
        <input
          type="hidden"
          value={equipmentType?.id ?? ''}
          {...register('id', { valueAsNumber: true })}
        />
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
              {loading ? t('machineEquipmentType.form.saveChangesLoading') : t('machineEquipmentType.form.saveChanges')}
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

export default EditMachineEquipmentType;