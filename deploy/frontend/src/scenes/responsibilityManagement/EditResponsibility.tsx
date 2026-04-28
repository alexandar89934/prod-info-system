import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, CircularProgress, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import Header from '@/reusableComponents/Header';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import { useAppDispatch } from '@/state/hooks';
import {
  fetchResponsibilityById,
  updateResponsibility,
} from '@/state/responsibility/responsibility.actions';
import {
  selectCurrentResponsibility,
  selectResponsibilityError,
  selectResponsibilityLoading,
  selectResponsibilitySuccess,
} from '@/state/responsibility/responsibility.selectors';
import {
  clearError,
  clearSuccess,
} from '@/state/responsibility/responsibility.slice';
import { EditResponsibilityFormData } from '@/state/responsibility/responsibility.types';
import { editResponsibilitySchema } from '@/zodValidationSchemas/responsibility.schema';

type FormData = z.infer<typeof editResponsibilitySchema>;

const EditResponsibility = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loading = useSelector(selectResponsibilityLoading);
  const error = useSelector(selectResponsibilityError);
  const success = useSelector(selectResponsibilitySuccess);
  const responsibility = useSelector(selectCurrentResponsibility);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(editResponsibilitySchema),
    defaultValues: { id: Number(id), label: '', description: '' },
  });

  useEffect(() => {
    if (id) dispatch(fetchResponsibilityById(Number(id)));
  }, [dispatch, id]);

  useEffect(() => {
    if (responsibility) {
      reset({
        id: responsibility.id as number,
        label: responsibility.label,
        description: responsibility.description ?? '',
      });
    }
  }, [responsibility, reset]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearError());
      dispatch(clearSuccess());
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, success, dispatch]);

  const onSubmit = async (data: FormData) => {
    await dispatch(updateResponsibility(data as EditResponsibilityFormData)).unwrap();
    navigate('/responsibilities');
  };

  const onCancel = () => navigate('/responsibilities');

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
        <Header title={t('responsibility.form.editTitle')} subtitle="" />
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pb: 2,
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.primary.main,
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.background.default },
          }}
        >
          <Controller
            name="label"
            control={control}
            render={({ field }) => (
              <LabeledXtField
                id="label"
                label={t('responsibility.form.label')}
                value={field.value}
                onChange={field.onChange}
                error={errors.label}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <LabeledXtField
                id="description"
                label={t('responsibility.form.description')}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.description}
                multiline
                rows={3}
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
              {loading
                ? t('responsibility.form.saveChangesLoading')
                : t('responsibility.form.saveChanges')}
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
              {t('responsibility.form.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditResponsibility;