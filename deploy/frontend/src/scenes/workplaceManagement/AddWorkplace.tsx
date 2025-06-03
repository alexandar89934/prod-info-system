import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, CircularProgress, Alert, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import Header from '@/reusableComponents/Header';
import { LabeledXtSelect } from '@/reusableComponents/LabeledSelectField.tsx';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import { useAppDispatch } from '@/state/hooks';
import { addWorkplace } from '@/state/workplace/workplace.actions.ts';
import {
  selectWorkplaceLoading as selectLoading,
  selectWorkplaceError as selectError,
  selectWorkplaceSuccess as selectSuccess,
} from '@/state/workplace/workplace.selectors';
import { clearError, clearSuccess } from '@/state/workplace/workplace.slice';
import { fetchWorkplaceCategories } from '@/state/workplaceCategory/workplaceCategory.actions.ts';
import { selectWorkplaceCategories } from '@/state/workplaceCategory/workplaceCategory.selectors.ts';
import { workplaceSchema } from '@/zodValidationSchemas/workplace.schema';

type AddWorkplaceFormData = z.infer<typeof workplaceSchema>;

const AddWorkplace = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const success = useSelector(selectSuccess);

  const handleAddCategories = () => navigate('/addWorkplaceCategory');

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddWorkplaceFormData>({
    resolver: zodResolver(workplaceSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: 0,
    },
  });
  useEffect(() => {
    dispatch(
      fetchWorkplaceCategories({
        limit: 9999,
        page: 1,
        search: '',
        sortField: '',
        sortOrder: '',
      })
    );
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearError());
      dispatch(clearSuccess());
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, success, dispatch]);

  const onSubmit = async (data: AddWorkplaceFormData) => {
    await dispatch(addWorkplace(data)).unwrap();
    reset();
    navigate('/workplace');
  };

  const onCancel = () => {
    reset();
    navigate('/workplace');
  };

  const categories = useSelector(selectWorkplaceCategories) || [];

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
        <Header title="Add Workplace" subtitle="" />
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
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.categoryId}
                  options={categories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
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
                {loading ? 'Adding...' : 'Add Workplace'}
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
                  width: 'auto',
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

export default AddWorkplace;
