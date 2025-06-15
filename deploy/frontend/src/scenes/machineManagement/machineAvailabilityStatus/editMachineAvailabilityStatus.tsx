import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, Alert, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/reusableComponents/Header';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import { useAppDispatch } from '@/state/hooks';
import {
  fetchMachineAvailabilityStatusById,
  updateMachineAvailabilityStatus,
} from '@/state/machineAvailabilityStatus/machineAvailabilityStatus.actions';
import {
  selectCurrentMachineAvailabilityStatus,
  selectMachineAvailabilityStatusLoading as selectLoading,
  selectMachineAvailabilityStatusError as selectError,
  selectMachineAvailabilityStatusSuccess as selectSuccess,
} from '@/state/machineAvailabilityStatus/machineAvailabilityStatus.selectors';
import {
  clearError,
  clearSuccess,
} from '@/state/machineAvailabilityStatus/machineAvailabilityStatus.slice';
import { EditMachineAvailabilityStatusFormData } from '@/state/machineAvailabilityStatus/machineAvailabilityStatus.types';
import { machineAvailabilityStatusSchema } from '@/zodValidationSchemas/machineAvailabilityStatus.schema';

const EditMachineAvailabilityStatus = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const success = useSelector(selectSuccess);
  const status = useSelector(selectCurrentMachineAvailabilityStatus);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditMachineAvailabilityStatusFormData>({
    resolver: zodResolver(machineAvailabilityStatusSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchMachineAvailabilityStatusById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    console.log('AAA');
    console.log(status);
    if (status && status.name) {
      reset({
        id: Number(status.id),
        name: status.name,
        description: status.description ?? '',
      });
    }
  }, [status, reset]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearError());
      dispatch(clearSuccess());
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, success, dispatch]);

  const onSubmit = async (data: EditMachineAvailabilityStatusFormData) => {
    await dispatch(updateMachineAvailabilityStatus(data)).unwrap();
    navigate('/machineAvailabilityStatus');
  };

  const onCancel = () => {
    navigate('/machineAvailabilityStatus');
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
        <Header title="Edit Machine Availability Status" subtitle="" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            display="flex"
            flexDirection="row"
            flexWrap="wrap"
            gap={2}
            mb={2}
          >
            <input
              type="hidden"
              value={status?.id ?? ''}
              {...register('id', { valueAsNumber: true })}
            />
            <Box flex="1 1 65%" display="flex" flexDirection="column" gap={2}>
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

export default EditMachineAvailabilityStatus;
