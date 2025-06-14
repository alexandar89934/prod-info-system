import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, CircularProgress, Alert, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/reusableComponents/Header';
import { LabeledXtSelect } from '@/reusableComponents/LabeledSelectField.tsx';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import { useAppDispatch } from '@/state/hooks';
import {
  fetchWorkplaceById,
  updateWorkplace,
} from '@/state/workplace/workplace.actions.ts';
import {
  selectWorkplaceLoading as selectLoading,
  selectWorkplaceError as selectError,
  selectWorkplaceSuccess as selectSuccess,
  selectCurrentWorkplace,
} from '@/state/workplace/workplace.selectors';
import { clearError, clearSuccess } from '@/state/workplace/workplace.slice.ts';
import { EditWorkplaceFormData } from '@/state/workplace/workplace.types';
import { fetchWorkplaceCategories } from '@/state/workplaceCategory/workplaceCategory.actions.ts';
import { selectWorkplaceCategories } from '@/state/workplaceCategory/workplaceCategory.selectors.ts';
import { workplaceSchema } from '@/zodValidationSchemas/workplace.schema';

type WorkplaceParams = {
  id: string;
};

const EditWorkplace = () => {
  const theme = useTheme();
  const { id } = useParams<WorkplaceParams>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const success = useSelector(selectSuccess);
  const workplace = useSelector(selectCurrentWorkplace);
  const categories = useSelector(selectWorkplaceCategories) || [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditWorkplaceFormData>({
    resolver: zodResolver(workplaceSchema),
    defaultValues: {
      id: 0,
      name: '',
      description: '',
      categoryId: 0,
    },
  });

  const handleAddCategories = () => navigate('/addWorkplaceCategory');

  useEffect(() => {
    if (id) {
      dispatch(fetchWorkplaceById(id));
    }
    dispatch(
      fetchWorkplaceCategories({
        limit: 9999,
        page: 1,
        search: '',
        sortField: '',
        sortOrder: '',
      })
    );
  }, [dispatch, id]);

  useEffect(() => {
    if (workplace) {
      reset({
        id: workplace.id,
        name: workplace.name,
        description: workplace.description ?? '',
        categoryId: workplace.categoryId,
      });
    }
  }, [workplace, reset]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearError());
      dispatch(clearSuccess());
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, success, dispatch]);

  const onSubmit = async (data: EditWorkplaceFormData) => {
    await dispatch(updateWorkplace(data)).unwrap();
    navigate('/workplace');
  };

  const onCancel = () => {
    navigate('/workplace');
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
        <Header title="Edit Workplace" subtitle="" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" flexDirection="column" gap={2} mb={2}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <LabeledXtField
                  id="name"
                  label="Name"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.name}
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
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.description}
                  multiline
                  rows={4}
                />
              )}
            />
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <LabeledXtSelect
                  id="categoryId"
                  label="Category"
                  options={categories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.categoryId}
                />
              )}
            />
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddCategories}
                size="small"
              >
                Add Workplace Category
              </Button>
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
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
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

export default EditWorkplace;
