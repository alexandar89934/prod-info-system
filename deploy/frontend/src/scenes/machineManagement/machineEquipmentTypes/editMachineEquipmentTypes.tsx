import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, Alert, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{ p: 2, overflowY: 'auto' }}
    >
      <Box
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
        }}
      >
        <Header title="Edit Equipment Type" subtitle="" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" flexDirection="column" gap={2} mb={2}>
            <input
              type="hidden"
              value={equipmentType?.id ?? ''}
              {...register('id', { valueAsNumber: true })}
            />
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <LabeledXtField
                  id="name"
                  label="Name"
                  error={errors.name as any}
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
                  label="Description"
                  multiline
                  rows={4}
                  error={errors.description as any}
                  {...field}
                />
              )}
            />
          </Box>

          <Box
            sx={{
              position: 'sticky',
              bottom: 0,
              left: 0,
              width: '100%',
              p: 2,
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
                {loading ? 'Saving...' : 'Save Changes'}
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
                Cancel
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default EditMachineEquipmentType;
