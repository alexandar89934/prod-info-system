import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Header from '@/reusableComponents/Header';
import ImageGallery from '@/reusableComponents/ImageGallery.tsx';
import { LabeledXtSelect } from '@/reusableComponents/LabeledSelectField.tsx';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import MachineDocumentUpload from '@/reusableComponents/MachineDocumentUpload.tsx';
import { fetchMolds } from '@/state/mold/mold.actions';
import { selectMolds } from '@/state/mold/mold.selectors';
import { addItem } from '@/state/item/item.actions';
import { clearError, clearSuccess } from '@/state/item/item.slice';
import {
  selectItemError,
  selectItemLoading,
  selectItemSuccess,
} from '@/state/item/item.selectors';
import { AddItemFormData } from '@/state/item/item.types';
import { AppDispatch } from '@/state/store';
import {
  ITEM_APPROVAL_LEVELS,
  ITEM_CATEGORIES,
  ITEM_UNITS,
  itemSchema,
} from '@/zodValidationSchemas/item.schema';

import { useItemForm } from './useItemForm';

const sectionLabel = (text: string) => (
  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
    {text}
  </Typography>
);

const AddItem = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const molds = useSelector(selectMolds);
  const loading = useSelector(selectItemLoading);
  const error = useSelector(selectItemError);
  const success = useSelector(selectItemSuccess);

  const {
    pictures,
    setPictures,
    picturesToSubmit,
    documents,
    setDocuments,
    documentsToSubmit,
    fileLoading,
    fileError,
    handleImagesSelected,
    handleImageRemove,
  } = useItemForm();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<AddItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      itemCode: '',
      name: '',
      category: 'finished_good',
      unit: 'kom',
      pictures: [],
      documents: [],
    },
  });

  useEffect(() => {
    dispatch(fetchMolds({ page: 1, limit: 200, search: '', sortField: '', sortOrder: '' }));
  }, [dispatch]);

  useEffect(() => {
    if (success) dispatch(clearSuccess());
    if (error) dispatch(clearError());
  }, [success, error, dispatch]);

  const onSubmit = async (data: AddItemFormData) => {
    const result = await dispatch(addItem({ ...data, pictures: picturesToSubmit, documents: documentsToSubmit }));
    if (addItem.fulfilled.match(result)) {
      reset();
      setPictures([]);
      setDocuments([]);
      navigate('/item');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%" sx={{ p: 2, overflow: 'hidden' }}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        width="100%"
        maxWidth="900px"
        p={3}
        border="1px solid"
        borderColor="grey.300"
        borderRadius={2}
        boxShadow={1}
        sx={{ backgroundColor: theme.palette.background.default, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <Header title={t('item.form.addTitle')} subtitle="" />

        <Box sx={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', display: 'flex', flexDirection: 'column', gap: 2, pb: 2, '&::-webkit-scrollbar': { width: 8 }, '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.primary.main, borderRadius: 4 } }}>

          {sectionLabel(t('item.form.sectionIdentity'))}
          <Controller name="itemCode" control={control} render={({ field }) => (
            <LabeledXtField id="itemCode" label={t('item.form.itemCode')} error={errors.itemCode} {...field} />
          )} />
          <Controller name="name" control={control} render={({ field }) => (
            <LabeledXtField id="name" label={t('item.form.name')} error={errors.name} {...field} />
          )} />
          <Controller name="category" control={control} render={({ field, fieldState }) => (
            <LabeledXtSelect id="category" label={t('item.form.category')} value={field.value} onChange={(e) => field.onChange(e.target.value)} error={fieldState.error}
              options={ITEM_CATEGORIES.map((c) => ({ value: c, label: t(`item.category.${c}`) }))}
              disabledDefaultText={t('item.form.selectCategory')}
            />
          )} />
          <Controller name="unit" control={control} render={({ field, fieldState }) => (
            <LabeledXtSelect id="unit" label={t('item.form.unit')} value={field.value} onChange={(e) => field.onChange(e.target.value)} error={fieldState.error}
              options={ITEM_UNITS.map((u) => ({ value: u, label: u }))}
              disabledDefaultText={t('item.form.selectUnit')}
            />
          )} />
          <Controller name="approvalLevel" control={control} render={({ field, fieldState }) => (
            <LabeledXtSelect id="approvalLevel" label={t('item.form.approvalLevel')} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || null)} error={fieldState.error}
              options={ITEM_APPROVAL_LEVELS.map((l) => ({ value: l, label: t(`item.approvalLevel.${l}`) }))}
              disabledDefaultText={t('item.form.noApproval')}
            />
          )} />
          <Controller name="toolId" control={control} render={({ field, fieldState }) => (
            <LabeledXtSelect
              id="toolId"
              label={t('item.form.tool')}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value || null)}
              error={fieldState.error}
              options={molds.map((m) => ({ value: m.id ?? '', label: `#${m.inventoryNumber} — ${m.name}` }))}
              disabledDefaultText={t('item.form.noTool')}
            />
          )} />

          {sectionLabel(t('item.form.sectionPricing'))}
          <Controller name="priceEurPerUnit" control={control} render={({ field }) => (
            <LabeledXtField id="priceEurPerUnit" label={`${t('item.form.priceEurPerUnit')} (€)`} type="number" error={errors.priceEurPerUnit} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />

          {sectionLabel(t('item.form.sectionMedia'))}
          <ImageGallery
            galleryImages={pictures}
            onImagesSelected={handleImagesSelected}
            onImageRemove={handleImageRemove}
            isLoading={fileLoading}
          />

          {sectionLabel(t('item.form.sectionDocuments'))}
          <MachineDocumentUpload
            documents={documents}
            onChange={setDocuments}
            isLoading={fileLoading}
          />

          {fileError && <Alert severity="error">{fileError}</Alert>}

          {sectionLabel(t('item.form.sectionNotes'))}
          <Controller name="notes" control={control} render={({ field }) => (
            <LabeledXtField id="notes" label={t('item.form.notes')} multiline rows={3} error={errors.notes} {...field} value={field.value ?? ''} />
          )} />

          <Divider />
        </Box>

        <Box sx={{ flexShrink: 0, pt: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: theme.palette.background.default }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box display="flex" gap={2}>
            <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : undefined}>
              {loading ? t('item.form.addSubmitLoading') : t('item.form.addSubmit')}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/item')} disabled={loading} sx={{ color: theme.palette.primary[100], borderColor: theme.palette.primary[100], '&:hover': { borderColor: theme.palette.primary[200], backgroundColor: theme.palette.primary[100], color: theme.palette.common.white } }}>
              {t('item.form.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddItem;