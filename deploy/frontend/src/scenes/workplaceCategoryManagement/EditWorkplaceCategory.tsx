import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, Alert, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/reusableComponents/Header';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import { useAppDispatch } from '@/state/hooks';
import { clearError, clearSuccess } from '@/state/workplace/workplace.slice';
import {
  fetchWorkplaceCategoryById,
  updateWorkplaceCategory,
} from '@/state/workplaceCategory/workplaceCategory.actions.ts';
import {
  selectCurrentWorkplaceCategory,
  selectWorkplaceCategoryLoading as selectLoading,
  selectWorkplaceCategoryError as selectError,
  selectWorkplaceCategorySuccess as selectSuccess,
} from '@/state/workplaceCategory/workplaceCategory.selectors';
import { EditWorkplaceCategoryFormData } from '@/state/workplaceCategory/workplaceCategory.types';
import { workplaceCategorySchema } from '@/zodValidationSchemas/workplaceCategory.schema';

const EditWorkplaceCategory = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const success = useSelector(selectSuccess);
  const category = useSelector(selectCurrentWorkplaceCategory);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditWorkplaceCategoryFormData>({
    resolver: zodResolver(workplaceCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchWorkplaceCategoryById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (category && category.name) {
      reset({
        id: Number(category.id),
        name: category.name,
        description: category.description ?? '',
      });
    }
  }, [category, reset]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearError());
      dispatch(clearSuccess());
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, success, dispatch]);

  const onSubmit = async (data: EditWorkplaceCategoryFormData) => {
    await dispatch(updateWorkplaceCategory(data)).unwrap();
    navigate('/workplaceCategories');
  };

  const onCancel = () => {
    navigate('/workplaceCategories');
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
        <Header title="Edit Workplace Category" subtitle="" />
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
              value={category?.id ?? ''}
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

export default EditWorkplaceCategory;
