import { zodResolver } from '@hookform/resolvers/zod';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/reusableComponents/Header';
import { uploadSingleFile } from '@/state/fileUploads/files.actions';
import { selectLoading as selectFileLoading } from '@/state/fileUploads/files.selectors';
import { fetchPackagingUnitById, updatePackagingUnit } from '@/state/packagingUnit/packagingUnit.actions';
import { selectCurrentPackagingUnit, selectPackagingUnitError, selectPackagingUnitLoading, selectPackagingUnitSuccess } from '@/state/packagingUnit/packagingUnit.selectors';
import { clearError, clearSuccess } from '@/state/packagingUnit/packagingUnit.slice';
import { useAppDispatch } from '@/state/hooks';
import { PackagingUnitFormData, packagingUnitSchema } from '@/zodValidationSchemas/packagingUnit.schema';

type PictureRef = { name: string; path: string; dateAdded: string | Date };

const EditPackagingUnit = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const current = useSelector(selectCurrentPackagingUnit);
  const loading = useSelector(selectPackagingUnitLoading);
  const error = useSelector(selectPackagingUnitError);
  const success = useSelector(selectPackagingUnitSuccess);
  const fileLoading = useSelector(selectFileLoading);

  const [picture, setPicture] = useState<PictureRef | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PackagingUnitFormData>({
    resolver: zodResolver(packagingUnitSchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (id) dispatch(fetchPackagingUnitById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (current) {
      reset({ name: current.name, description: current.description ?? '' });
      setPicture(current.picture ?? null);
    }
  }, [current, reset]);

  useEffect(() => {
    if (success) {
      setNotification({ message: success, type: 'success' });
      dispatch(clearSuccess());
      setTimeout(() => navigate('/packaging-unit'), 1200);
    }
    if (error) {
      setNotification({ message: error, type: 'error' });
      dispatch(clearError());
    }
  }, [success, error, dispatch, navigate]);

  const handlePictureSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('uploadSingleFile', file);
    const result = await dispatch(uploadSingleFile(formData));
    if (uploadSingleFile.fulfilled.match(result)) {
      setPicture({ name: result.payload.name, path: result.payload.path, dateAdded: new Date().toISOString() });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: PackagingUnitFormData) => {
    if (!id) return;
    await dispatch(updatePackagingUnit({
      id,
      name: data.name,
      description: data.description ?? null,
      picture: picture ?? null,
    }));
  };

  if (loading && !current) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, pt: { xs: 1, sm: 2 }, pb: 2 }}>
      <Header title={t('packagingUnit.form.editTitle')} subtitle="" />

      <Paper variant="outlined" sx={{ p: 3, maxWidth: 600, mt: 2 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2.5}>
          <TextField
            label={t('packagingUnit.form.name')}
            size="small"
            fullWidth
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            label={t('packagingUnit.form.description')}
            size="small"
            fullWidth
            multiline
            rows={3}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message as string | undefined}
          />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
              {t('packagingUnit.form.picture')}
            </Typography>
            {picture ? (
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  component="img"
                  src={`${import.meta.env.VITE_API_URL ?? ''}${picture.path}`}
                  alt={picture.name}
                  sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}
                  onError={(e) => { const img = e.target as HTMLImageElement; img.onerror = null; img.style.display = 'none'; }}
                />
                <IconButton color="error" size="small" onClick={() => setPicture(null)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="outlined"
                size="small"
                startIcon={fileLoading ? <CircularProgress size={16} /> : <AddPhotoAlternateIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={fileLoading}
                sx={{
                  color: theme.palette.primary[100],
                  borderColor: theme.palette.primary[100],
                  '&:hover': { borderColor: theme.palette.primary[200], backgroundColor: theme.palette.primary[100], color: theme.palette.common.white },
                }}
              >
                {t('packagingUnit.form.uploadPicture')}
              </Button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePictureSelect} />
          </Box>

          <Box display="flex" gap={1} justifyContent="flex-end" pt={1}>
            <Button
              variant="outlined"
              disabled={loading}
              onClick={() => navigate('/packaging-unit')}
              sx={{
                color: theme.palette.primary[100],
                borderColor: theme.palette.primary[100],
                '&:hover': { borderColor: theme.palette.primary[200], backgroundColor: theme.palette.primary[100], color: theme.palette.common.white },
              }}
            >
              {t('packagingUnit.form.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={loading || fileLoading}>
              {loading ? <CircularProgress size={20} /> : t('packagingUnit.form.editSubmit')}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar open={!!notification} autoHideDuration={4000} onClose={() => setNotification(null)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={notification?.type} onClose={() => setNotification(null)} sx={{ width: '100%' }}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditPackagingUnit;