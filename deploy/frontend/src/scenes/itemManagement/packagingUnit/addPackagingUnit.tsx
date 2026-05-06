import { zodResolver } from '@hookform/resolvers/zod';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  Typography,
  useTheme,
} from '@mui/material';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import { useAppDispatch } from '@/state/hooks';
import { uploadSingleFile } from '@/state/fileUploads/files.actions';
import { selectLoading as selectFileLoading } from '@/state/fileUploads/files.selectors';
import { addPackagingUnit } from '@/state/packagingUnit/packagingUnit.actions';
import { selectPackagingUnitError, selectPackagingUnitLoading } from '@/state/packagingUnit/packagingUnit.selectors';
import { PackagingUnitFormData, packagingUnitSchema } from '@/zodValidationSchemas/packagingUnit.schema';

type PictureRef = { name: string; path: string; dateAdded: string };

const AddPackagingUnit = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loading = useSelector(selectPackagingUnitLoading);
  const error = useSelector(selectPackagingUnitError);
  const fileLoading = useSelector(selectFileLoading);

  const [picture, setPicture] = useState<PictureRef | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { handleSubmit, control, formState: { errors } } = useForm<PackagingUnitFormData>({
    resolver: zodResolver(packagingUnitSchema),
    defaultValues: { name: '', description: '' },
  });

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
    const result = await dispatch(addPackagingUnit({
      name: data.name,
      description: data.description ?? null,
      picture: picture ?? null,
    }));
    if (addPackagingUnit.fulfilled.match(result)) navigate('/packaging-unit');
  };

  const sectionLabel = (text: string) => (
    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
      {text}
    </Typography>
  );

  const cancelSx = {
    color: theme.palette.primary[100],
    borderColor: theme.palette.primary[100],
    '&:hover': { borderColor: theme.palette.primary[200], backgroundColor: theme.palette.primary[100], color: theme.palette.common.white },
  };

  const arrayLabelSx = {
    minWidth: '220px',
    position: 'relative' as const,
    transform: 'none',
    marginBottom: { xs: 1, sm: 0 },
    whiteSpace: 'normal' as const,
    overflow: 'visible' as const,
    lineHeight: 1.4,
    paddingTop: { sm: '14px' },
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%" sx={{ p: 2, overflow: 'hidden' }}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        width="100%"
        maxWidth="1100px"
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
        <Typography variant="h4" align="center" mb={1}>{t('packagingUnit.form.addTitle')}</Typography>

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            display: 'flex',
            flexDirection: 'column',
            pb: 2,
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.primary.main, borderRadius: 4 },
            '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.background.default },
          }}
        >
          {sectionLabel(t('packagingUnit.form.addTitle'))}
          <Controller name="name" control={control} render={({ field }) => (
            <LabeledXtField id="name" label={t('packagingUnit.form.name')} value={field.value ?? ''} onChange={field.onChange} error={errors.name} />
          )} />
          <Controller name="description" control={control} render={({ field }) => (
            <LabeledXtField id="description" label={t('packagingUnit.form.description')} value={field.value ?? ''} onChange={field.onChange} error={errors.description} multiline rows={3} />
          )} />

          {sectionLabel(t('packagingUnit.form.picture'))}
          <FormControl fullWidth margin="normal" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start', gap: { xs: 1, sm: 2 } }}>
            <InputLabel sx={arrayLabelSx}>{t('packagingUnit.form.picture')}:</InputLabel>
            <Box>
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
                <Button variant="outlined" size="small" startIcon={fileLoading ? <CircularProgress size={16} /> : <AddPhotoAlternateIcon />} onClick={() => fileInputRef.current?.click()} disabled={fileLoading} sx={cancelSx}>
                  {t('packagingUnit.form.uploadPicture')}
                </Button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePictureSelect} />
            </Box>
          </FormControl>
        </Box>

        <Box sx={{ flexShrink: 0, pt: 2, pb: 2, px: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: theme.palette.background.default }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box display="flex" gap={2}>
            <Button type="submit" variant="contained" disabled={loading || fileLoading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}>
              {loading ? `${t('packagingUnit.form.addSubmit')}...` : t('packagingUnit.form.addSubmit')}
            </Button>
            <Button variant="outlined" disabled={loading} onClick={() => navigate('/packaging-unit')} sx={cancelSx}>
              {t('packagingUnit.form.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddPackagingUnit;