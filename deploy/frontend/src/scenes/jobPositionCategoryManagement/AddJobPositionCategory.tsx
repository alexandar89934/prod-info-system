import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, Alert, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { Controller, FieldError, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Header from '@/reusableComponents/Header';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import { useAppDispatch } from '@/state/hooks';
import { addJobPositionCategory } from '@/state/jobPositionCategory/jobPositionCategory.actions.ts';
import {
  selectJobPositionCategoryLoading as selectLoading,
  selectJobPositionCategoryError as selectError,
  selectJobPositionCategorySuccess as selectSuccess,
} from '@/state/jobPositionCategory/jobPositionCategory.selectors';
import {
  clearError,
  clearSuccess,
} from '@/state/jobPositionCategory/jobPositionCategory.slice';
import { AddJobPositionCategoryFormData } from '@/state/jobPositionCategory/jobPositionCategory.types';
import { jobPositionCategorySchema } from '@/zodValidationSchemas/jobPositionCategory.schema';

const AddJobPositionCategory = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loading = useSelector(selectLoading);
  let error = useSelector(selectError);
  let success = useSelector(selectSuccess);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddJobPositionCategoryFormData>({
    resolver: zodResolver(jobPositionCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearError());
      dispatch(clearSuccess());
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, success, dispatch]);

  const onSubmit = async (data: AddJobPositionCategoryFormData) => {
    try {
      await dispatch(addJobPositionCategory(data)).unwrap();
      reset();
      navigate('/jobPositionCategories');
    } catch (err) {
      error = typeof error === 'string' ? err : 'Unknown error occurred';
      success = null;
    }
  };

  const onCancel = () => {
    reset();
    navigate('/jobPositionCategories');
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
        <Header title={t('jobPositionCategory.form.addTitle')} subtitle="" />
        <Box sx={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', display: 'flex', flexDirection: 'column', gap: 2, pb: 2, '&::-webkit-scrollbar': { width: 8 }, '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.primary.main, borderRadius: 4 }, '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.background.default } }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <LabeledXtField
                id="name"
                label={t('jobPositionCategory.form.name')}
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
                label={t('jobPositionCategory.form.description')}
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
              {loading ? t('jobPositionCategory.form.addSubmitLoading') : t('jobPositionCategory.form.addSubmit')}
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
              {t('jobPositionCategory.form.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddJobPositionCategory;