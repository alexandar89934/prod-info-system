import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { useAppDispatch } from '@/state/hooks';
import { fetchVehicleById, updateVehicle } from '@/state/vehicle/vehicle.actions';
import {
  selectCurrentVehicle,
  selectVehicleError,
  selectVehicleLoading,
} from '@/state/vehicle/vehicle.selectors';
import { clearError, resetState } from '@/state/vehicle/vehicle.slice';
import { VehicleFormData, vehicleSchema } from '@/zodValidationSchemas/vehicle.schema';

const VEHICLE_TYPES = ['car', 'forklift', 'truck', 'other'] as const;

const EditVehicle = () => {
  const { t }    = useTranslation();
  const theme    = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id }   = useParams<{ id: string }>();

  const loading = useSelector(selectVehicleLoading);
  const error   = useSelector(selectVehicleError);
  const current = useSelector(selectCurrentVehicle);

  const {
    handleSubmit, control, reset, formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: { name: '', type: 'car', licensePlate: null, model: null, yearOfManufacture: null, notes: null },
  });

  useEffect(() => {
    if (id) dispatch(fetchVehicleById(id));
    return () => { dispatch(resetState()); };
  }, [dispatch, id]);

  useEffect(() => {
    if (current) {
      reset({
        name:              current.name,
        type:              current.type,
        licensePlate:      current.licensePlate,
        model:             current.model,
        yearOfManufacture: current.yearOfManufacture,
        notes:             current.notes,
      });
    }
  }, [current, reset]);

  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const onSubmit = async (data: VehicleFormData) => {
    if (!id) return;
    const result = await dispatch(updateVehicle({
      id,
      name:              data.name,
      type:              data.type,
      licensePlate:      data.licensePlate ?? null,
      model:             data.model ?? null,
      yearOfManufacture: data.yearOfManufacture ?? null,
      notes:             data.notes ?? null,
    }));
    if (updateVehicle.fulfilled.match(result)) navigate('/vehicle');
  };

  const cancelSx = {
    color: theme.palette.primary[100],
    borderColor: theme.palette.primary[100],
    '&:hover': { borderColor: theme.palette.primary[200], backgroundColor: theme.palette.primary[100], color: theme.palette.common.white },
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%" sx={{ p: 2 }}>
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
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <Typography variant="h4" align="center" mb={2}>{t('vehicle.edit')}</Typography>

        <Controller name="name" control={control} render={({ field }) => (
          <TextField fullWidth label={t('vehicle.name')} {...field} error={!!errors.name}
            helperText={errors.name?.message} margin="normal" size="small" />
        )} />

        <FormControl fullWidth margin="normal" size="small" error={!!errors.type}>
          <InputLabel>{t('vehicle.type')}</InputLabel>
          <Controller name="type" control={control} render={({ field }) => (
            <Select label={t('vehicle.type')} value={field.value}
              onChange={(e: SelectChangeEvent) => field.onChange(e.target.value)}>
              {VEHICLE_TYPES.map((vt) => (
                <MenuItem key={vt} value={vt}>{t(`vehicle.types.${vt}`)}</MenuItem>
              ))}
            </Select>
          )} />
          {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
        </FormControl>

        <Controller name="licensePlate" control={control} render={({ field }) => (
          <TextField fullWidth label={t('vehicle.licensePlate')} value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value || null)}
            error={!!errors.licensePlate} helperText={errors.licensePlate?.message} margin="normal" size="small" />
        )} />

        <Controller name="model" control={control} render={({ field }) => (
          <TextField fullWidth label={t('vehicle.model')} value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value || null)}
            error={!!errors.model} helperText={errors.model?.message} margin="normal" size="small" />
        )} />

        <Controller name="yearOfManufacture" control={control} render={({ field }) => (
          <TextField fullWidth label={t('vehicle.yearOfManufacture')} type="number"
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
            error={!!errors.yearOfManufacture} helperText={errors.yearOfManufacture?.message}
            margin="normal" size="small" inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }} />
        )} />

        <Controller name="notes" control={control} render={({ field }) => (
          <TextField fullWidth label={t('vehicle.notes')} value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value || null)}
            error={!!errors.notes} helperText={errors.notes?.message}
            margin="normal" size="small" multiline rows={3} />
        )} />

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        <Box display="flex" gap={2} mt={3}>
          <Button type="submit" variant="contained" disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}>
            {loading ? `${t('vehicle.edit')}...` : t('vehicle.edit')}
          </Button>
          <Button variant="outlined" disabled={loading} onClick={() => navigate('/vehicle')} sx={cancelSx}>
            {t('common.cancel')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditVehicle;