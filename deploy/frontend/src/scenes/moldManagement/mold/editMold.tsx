import { zodResolver } from '@hookform/resolvers/zod';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/reusableComponents/Header';
import ImageGallery from '@/reusableComponents/ImageGallery.tsx';
import { LabeledXtSelect } from '@/reusableComponents/LabeledSelectField.tsx';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import MachineDocumentUpload from '@/reusableComponents/MachineDocumentUpload.tsx';
import { fetchMachines } from '@/state/machine/machine.actions';
import { selectMachines } from '@/state/machine/machine.selectors';
import { fetchCompaniesList } from '@/state/company/company.actions';
import { selectCompaniesList } from '@/state/company/company.selectors';
import { fetchMoldById, updateMold } from '@/state/mold/mold.actions';
import {
  selectCurrentMold,
  selectMoldError,
  selectMoldLoading,
  selectMoldSuccess,
} from '@/state/mold/mold.selectors';
import { clearError, clearSuccess } from '@/state/mold/mold.slice';
import { EditMoldFormData } from '@/state/mold/mold.types';
import { AppDispatch } from '@/state/store';
import { moldSchema } from '@/zodValidationSchemas/mold.schema';

import { useMoldForm } from './useMoldForm';

const sectionLabel = (text: string) => (
  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
    {text}
  </Typography>
);

const EditMold = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const loading = useSelector(selectMoldLoading);
  const error = useSelector(selectMoldError);
  const success = useSelector(selectMoldSuccess);
  const currentMold = useSelector(selectCurrentMold);
  const machines = useSelector(selectMachines);
  const companiesList = useSelector(selectCompaniesList);

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
  } = useMoldForm();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<EditMoldFormData>({
    resolver: zodResolver(moldSchema),
    defaultValues: { name: '', inventoryNumber: 0, status: 'ok', pieceCounter: 0, temperingTemperatures: [], pictures: [], documents: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'temperingTemperatures' });

  useEffect(() => {
    if (id) dispatch(fetchMoldById(id));
    dispatch(fetchMachines({ page: 1, limit: 200, search: '', sortField: '', sortOrder: '' }));
    dispatch(fetchCompaniesList());
  }, [dispatch, id]);

  useEffect(() => {
    if (currentMold) {
      reset({
        ...currentMold,
        temperingTemperatures: currentMold.temperingTemperatures ?? [],
        pictures: currentMold.pictures ?? [],
        documents: currentMold.documents ?? [],
      });
      if (currentMold.pictures) {
        setPictures(
          currentMold.pictures.map((p) => ({
            name: p.name,
            path: p.path,
            dateAdded: p.dateAdded instanceof Date ? p.dateAdded.toISOString() : p.dateAdded,
          }))
        );
      }
      if (currentMold.documents) {
        setDocuments(
          currentMold.documents.map((d) => ({
            name: d.name,
            path: d.path,
            dateAdded: d.dateAdded instanceof Date ? d.dateAdded.toISOString() : d.dateAdded,
          }))
        );
      }
    }
  }, [currentMold, reset, setPictures, setDocuments]);

  useEffect(() => {
    if (success) dispatch(clearSuccess());
    if (error) dispatch(clearError());
  }, [success, error, dispatch]);

  const onSubmit = async (data: EditMoldFormData) => {
    if (!id) return;
    const result = await dispatch(updateMold({ ...data, id, pictures: picturesToSubmit, documents: documentsToSubmit }));
    if (updateMold.fulfilled.match(result)) {
      navigate('/mold');
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
        <Header title={t('mold.form.editTitle')} subtitle={currentMold?.name ?? ''} />

        <Box sx={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', display: 'flex', flexDirection: 'column', gap: 2, pb: 2, '&::-webkit-scrollbar': { width: 8 }, '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.primary.main, borderRadius: 4 } }}>

          {sectionLabel(t('mold.form.sectionBasic'))}
          <Controller name="inventoryNumber" control={control} render={({ field }) => (
            <LabeledXtField id="inventoryNumber" label={t('mold.form.inventoryNumber')} type="number" error={errors.inventoryNumber} {...field} value={field.value ?? 0} onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
          )} />
          <Controller name="name" control={control} render={({ field }) => (
            <LabeledXtField id="name" label={t('mold.form.name')} error={errors.name} {...field} />
          )} />
          <Controller name="status" control={control} render={({ field, fieldState }) => (
            <LabeledXtSelect id="status" label={t('mold.form.status')} value={field.value ?? 'ok'} onChange={(e) => field.onChange(e.target.value)} error={fieldState.error}
              options={[{ value: 'ok', label: t('mold.status.ok') }, { value: 'fault', label: t('mold.status.fault') }, { value: 'repair', label: t('mold.status.repair') }]}
              disabledDefaultText={t('mold.form.selectStatus')}
            />
          )} />
          <Controller name="serviceCategory" control={control} render={({ field, fieldState }) => (
            <LabeledXtSelect id="serviceCategory" label={t('mold.form.serviceCategory')} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || null)} error={fieldState.error}
              options={['S-1', 'S-2', 'S-3', 'S-4'].map((v) => ({ value: v, label: v }))}
              disabledDefaultText={t('mold.form.selectServiceCategory')}
            />
          )} />
          <Controller name="notes" control={control} render={({ field }) => (
            <LabeledXtField id="notes" label={t('mold.form.notes')} multiline rows={3} error={errors.notes} {...field} value={field.value ?? ''} />
          )} />
          <Controller name="currentMachineId" control={control} render={({ field, fieldState }) => (
            <LabeledXtSelect
              id="currentMachineId"
              label={t('mold.form.currentMachine')}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value || null)}
              error={fieldState.error}
              options={machines.map((m) => ({ value: m.id, label: `#${m.machineNumber} — ${m.name}` }))}
              disabledDefaultText={t('mold.form.notMounted')}
            />
          )} />
          <Controller name="ownedByCompanyId" control={control} render={({ field, fieldState }) => (
            <LabeledXtSelect
              id="ownedByCompanyId"
              label={t('mold.form.ownedByCompany')}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value || null)}
              error={fieldState.error}
              options={companiesList.map((c) => ({ value: c.id, label: c.name }))}
              disabledDefaultText={t('mold.form.noOwner')}
            />
          )} />

          {sectionLabel(t('mold.form.sectionDimensions'))}
          <Controller name="cavities" control={control} render={({ field }) => (
            <LabeledXtField id="cavities" label={t('mold.form.cavities')} type="number" error={errors.cavities} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />
          <Controller name="heightMM" control={control} render={({ field }) => (
            <LabeledXtField id="heightMM" label={`${t('mold.form.heightMM')} (mm)`} type="number" error={errors.heightMM} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />
          <Controller name="widthMM" control={control} render={({ field }) => (
            <LabeledXtField id="widthMM" label={`${t('mold.form.widthMM')} (mm)`} type="number" error={errors.widthMM} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />
          <Controller name="depthMM" control={control} render={({ field }) => (
            <LabeledXtField id="depthMM" label={`${t('mold.form.depthMM')} (mm)`} type="number" error={errors.depthMM} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />
          <Controller name="weight" control={control} render={({ field }) => (
            <LabeledXtField id="weight" label={`${t('mold.form.weight')} (kg)`} type="number" error={errors.weight} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />
          <Controller name="centeringDiameterMM" control={control} render={({ field }) => (
            <LabeledXtField id="centeringDiameterMM" label={`${t('mold.form.centeringDiameterMM')} (mm)`} type="number" error={errors.centeringDiameterMM} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />
          <Controller name="requiredClampingForceKN" control={control} render={({ field }) => (
            <LabeledXtField id="requiredClampingForceKN" label={`${t('mold.form.requiredClampingForceKN')} (kN)`} type="number" error={errors.requiredClampingForceKN} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />

          {sectionLabel(t('mold.form.sectionTempering'))}
          <Box display="flex" flexDirection="column" gap={1}>
            {fields.map((field, index) => (
              <Box key={field.id} display="flex" gap={1} alignItems="flex-start">
                <Box flex={2} minWidth={0}>
                  <Controller name={`temperingTemperatures.${index}.zone`} control={control} render={({ field: f }) => (
                    <LabeledXtField id={`zone-${index}`} label={t('mold.form.zone')} minWidth="60px" {...f} value={f.value ?? ''} />
                  )} />
                </Box>
                <Box flex={1} minWidth={0}>
                  <Controller name={`temperingTemperatures.${index}.minTemp`} control={control} render={({ field: f }) => (
                    <LabeledXtField id={`minTemp-${index}`} label={`${t('mold.form.minTemp')} (°C)`} type="number" minWidth="90px" {...f} value={f.value ?? ''} onChange={(e) => f.onChange(Number(e.target.value))} />
                  )} />
                </Box>
                <Box flex={1} minWidth={0}>
                  <Controller name={`temperingTemperatures.${index}.maxTemp`} control={control} render={({ field: f }) => (
                    <LabeledXtField id={`maxTemp-${index}`} label={`${t('mold.form.maxTemp')} (°C)`} type="number" minWidth="90px" {...f} value={f.value ?? ''} onChange={(e) => f.onChange(Number(e.target.value))} />
                  )} />
                </Box>
                <IconButton onClick={() => remove(index)} color="error" sx={{ mt: 2 }}>
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Box>
            ))}
            <Button variant="outlined" color="secondary" size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => append({ zone: '', minTemp: 0, maxTemp: 0 })} sx={{ alignSelf: 'flex-start' }}>
              {t('mold.form.addZone')}
            </Button>
          </Box>

          {sectionLabel(t('mold.form.sectionCounters'))}
          <Controller name="pieceCounter" control={control} render={({ field }) => (
            <LabeledXtField id="pieceCounter" label={t('mold.form.pieceCounter')} type="number" error={errors.pieceCounter} {...field} value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} />
          )} />

          {sectionLabel(t('mold.form.sectionMedia'))}
          <ImageGallery
            galleryImages={pictures}
            onImagesSelected={handleImagesSelected}
            onImageRemove={handleImageRemove}
            isLoading={fileLoading}
          />

          {sectionLabel(t('mold.form.sectionDocuments'))}
          <MachineDocumentUpload
            documents={documents}
            onChange={setDocuments}
            isLoading={fileLoading}
          />

          {fileError && <Alert severity="error">{fileError}</Alert>}

          <Divider />
        </Box>

        <Box sx={{ flexShrink: 0, pt: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: theme.palette.background.default }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box display="flex" gap={2}>
            <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : undefined}>
              {loading ? t('mold.form.editSubmitLoading') : t('mold.form.editSubmit')}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/mold')} disabled={loading} sx={{ color: theme.palette.primary[100], borderColor: theme.palette.primary[100], '&:hover': { borderColor: theme.palette.primary[200], backgroundColor: theme.palette.primary[100], color: theme.palette.common.white } }}>
              {t('mold.form.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditMold;