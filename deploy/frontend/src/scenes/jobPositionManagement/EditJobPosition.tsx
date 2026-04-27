import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, CircularProgress, Alert, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/reusableComponents/Header';
import { LabeledXtSelect } from '@/reusableComponents/LabeledSelectField.tsx';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import { useAppDispatch } from '@/state/hooks';
import {
  fetchJobPositionById,
  updateJobPosition,
} from '@/state/jobPosition/jobPosition.actions.ts';
import {
  selectJobPositionLoading as selectLoading,
  selectJobPositionError as selectError,
  selectJobPositionSuccess as selectSuccess,
  selectCurrentJobPosition,
} from '@/state/jobPosition/jobPosition.selectors';
import { clearError, clearSuccess } from '@/state/jobPosition/jobPosition.slice.ts';
import { EditJobPositionFormData } from '@/state/jobPosition/jobPosition.types';
import { fetchJobPositionCategories } from '@/state/jobPositionCategory/jobPositionCategory.actions.ts';
import { selectJobPositionCategories } from '@/state/jobPositionCategory/jobPositionCategory.selectors.ts';
import { jobPositionSchema } from '@/zodValidationSchemas/jobPosition.schema';

type JobPositionParams = {
  id: string;
};

const EditJobPosition = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useParams<JobPositionParams>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const success = useSelector(selectSuccess);
  const jobPosition = useSelector(selectCurrentJobPosition);
  const categories = useSelector(selectJobPositionCategories) || [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditJobPositionFormData>({
    resolver: zodResolver(jobPositionSchema),
    defaultValues: {
      id: 0,
      name: '',
      description: '',
      categoryId: 0,
    },
  });

  const handleAddCategories = () => navigate('/addJobPositionCategory');

  useEffect(() => {
    if (id) {
      dispatch(fetchJobPositionById(id));
    }
    dispatch(
      fetchJobPositionCategories({
        limit: 9999,
        page: 1,
        search: '',
        sortField: '',
        sortOrder: '',
      })
    );
  }, [dispatch, id]);

  useEffect(() => {
    if (jobPosition) {
      reset({
        id: jobPosition.id,
        name: jobPosition.name,
        description: jobPosition.description ?? '',
        categoryId: jobPosition.categoryId,
      });
    }
  }, [jobPosition, reset]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearError());
      dispatch(clearSuccess());
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, success, dispatch]);

  const onSubmit = async (data: EditJobPositionFormData) => {
    await dispatch(updateJobPosition(data)).unwrap();
    navigate('/jobPosition');
  };

  const onCancel = () => {
    navigate('/jobPosition');
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
        <Header title={t('jobPosition.form.editTitle')} subtitle="" />
        <Box sx={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', display: 'flex', flexDirection: 'column', gap: 2, pb: 2, '&::-webkit-scrollbar': { width: 8 }, '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.primary.main, borderRadius: 4 }, '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.background.default } }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <LabeledXtField
                id="name"
                label={t('jobPosition.form.name')}
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
                label={t('jobPosition.form.description')}
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
                label={t('jobPosition.form.category')}
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
              {t('jobPosition.form.addCategory')}
            </Button>
          </Box>
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
              {loading ? t('jobPosition.form.saveChangesLoading') : t('jobPosition.form.saveChanges')}
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
              {t('jobPosition.form.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditJobPosition;