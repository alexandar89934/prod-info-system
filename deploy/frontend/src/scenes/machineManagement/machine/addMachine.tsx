import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Header from '@/reusableComponents/Header';
import ImageGallery from '@/reusableComponents/ImageGallery.tsx';
import { LabeledXtSelect } from '@/reusableComponents/LabeledSelectField.tsx';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import MachineDocumentUpload from '@/reusableComponents/MachineDocumentUpload.tsx';
import { getName } from '@/state/auth/auth.selectors.ts';
import { useAppDispatch } from '@/state/hooks';
import { addMachine } from '@/state/machine/machine.actions.ts';
import { AddMachineFormData } from '@/state/machine/machine.types.ts';
import { machineSchema } from '@/zodValidationSchemas/machine.schema.ts';

import { useMachineForm } from './useMachineForm';

const AddMachine = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    availabilityStatuses,
    pictures,
    picturesToSubmit,
    documents,
    setDocuments,
    documentsToSubmit,
    fileLoading,
    fileError,
    loading,
    error,
    success,
    handleImagesSelected,
    handleImageRemove,
  } = useMachineForm();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMachineFormData>({
    resolver: zodResolver(machineSchema),
    defaultValues: {
      name: '',
      machineNumber: 0,
      serialNumber: '',
      yearOfManufacture: null,
      clampingForce: null,
      injectionWeight: '',
      controlSystem: '',
      description: '',
      automaticMode: false,
      semiAutomaticMode: false,
      manualMode: false,
      workHoursCounter: 0,
      pieceCounter: 0,
      scrapCounter: 0,
      workPermit: false,
      availabilityStatusId: null,
      createdBy: getName(),
    },
  });

  const onSubmit = async (data: AddMachineFormData) => {
    const result = await dispatch(addMachine({ ...data, pictures: picturesToSubmit, documents: documentsToSubmit }));
    if (addMachine.fulfilled.match(result)) {
      reset();
      navigate('/machine');
    }
  };

  const onCancel = () => {
    reset();
    navigate('/machine');
  };

  const sectionLabel = (text: string) => (
    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
      {text}
    </Typography>
  );

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
        <Header title={t('machine.form.addTitle')} subtitle="" />

        <Box sx={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', display: 'flex', flexDirection: 'column', gap: 2, pb: 2, '&::-webkit-scrollbar': { width: 8 }, '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.primary.main, borderRadius: 4 }, '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.background.default } }}>

          {sectionLabel(t('machine.form.sectionBasic'))}
          <Controller name="name" control={control} render={({ field }) => (
            <LabeledXtField id="name" label={t('machine.form.name')} error={errors.name} {...field} />
          )} />
          <Controller name="machineNumber" control={control} render={({ field }) => (
            <LabeledXtField id="machineNumber" label={t('machine.form.machineNumber')} type="number" error={errors.machineNumber} {...field} value={field.value ?? 0} onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
          )} />
          <Controller name="serialNumber" control={control} render={({ field }) => (
            <LabeledXtField id="serialNumber" label={t('machine.form.serialNumber')} error={errors.serialNumber} {...field} value={field.value ?? ''} />
          )} />
          <Controller name="yearOfManufacture" control={control} render={({ field }) => (
            <LabeledXtField id="yearOfManufacture" label={t('machine.form.yearOfManufacture')} type="number" error={errors.yearOfManufacture} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />
          <Controller name="controlSystem" control={control} render={({ field }) => (
            <LabeledXtField id="controlSystem" label={t('machine.form.controlSystem')} error={errors.controlSystem} {...field} value={field.value ?? ''} />
          )} />
          <Controller name="description" control={control} render={({ field }) => (
            <LabeledXtField id="description" label={t('machine.form.description')} multiline rows={3} error={errors.description} {...field} value={field.value ?? ''} />
          )} />

          {sectionLabel(t('machine.form.sectionStatus'))}
          <Controller name="availabilityStatusId" control={control} render={({ field, fieldState }) => (
            <LabeledXtSelect
              id="availabilityStatusId"
              label={t('machine.form.availabilityStatus')}
              value={field.value ?? ''}
              onChange={(event) => {
                const val = event.target.value;
                field.onChange(!val ? null : Number(val));
              }}
              error={fieldState.error}
              options={availabilityStatuses.map((s) => ({ value: s.id, label: s.name }))}
              disabledDefaultText={t('machine.form.selectStatus')}
            />
          )} />
          <Controller name="workPermit" control={control} render={({ field }) => (
            <FormControlLabel control={<Switch checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} />} label={t('machine.form.workPermit')} />
          )} />

          {sectionLabel(t('machine.form.sectionModes'))}
          <Controller name="automaticMode" control={control} render={({ field }) => (
            <FormControlLabel control={<Switch checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} />} label={t('machine.form.automaticMode')} />
          )} />
          <Controller name="semiAutomaticMode" control={control} render={({ field }) => (
            <FormControlLabel control={<Switch checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} />} label={t('machine.form.semiAutomaticMode')} />
          )} />
          <Controller name="manualMode" control={control} render={({ field }) => (
            <FormControlLabel control={<Switch checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} />} label={t('machine.form.manualMode')} />
          )} />

          {sectionLabel(t('machine.form.sectionTechnical'))}
          <Controller name="clampingForce" control={control} render={({ field }) => (
            <LabeledXtField id="clampingForce" label={t('machine.form.clampingForce')} type="number" error={errors.clampingForce} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />
          <Controller name="injectionWeight" control={control} render={({ field }) => (
            <LabeledXtField id="injectionWeight" label={t('machine.form.injectionWeight')} error={errors.injectionWeight} {...field} value={field.value ?? ''} />
          )} />

          {sectionLabel(t('machine.form.sectionMoldLimits'))}
          <Controller name="maxMoldWidth" control={control} render={({ field }) => (
            <LabeledXtField id="maxMoldWidth" label={t('machine.form.maxMoldWidth')} type="number" error={errors.maxMoldWidth} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />
          <Controller name="maxMoldHeight" control={control} render={({ field }) => (
            <LabeledXtField id="maxMoldHeight" label={t('machine.form.maxMoldHeight')} type="number" error={errors.maxMoldHeight} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />
          <Controller name="minMoldThickness" control={control} render={({ field }) => (
            <LabeledXtField id="minMoldThickness" label={t('machine.form.minMoldThickness')} type="number" error={errors.minMoldThickness} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />
          <Controller name="maxMoldThickness" control={control} render={({ field }) => (
            <LabeledXtField id="maxMoldThickness" label={t('machine.form.maxMoldThickness')} type="number" error={errors.maxMoldThickness} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />
          <Controller name="centeringRingFixedSide" control={control} render={({ field }) => (
            <LabeledXtField id="centeringRingFixedSide" label={t('machine.form.centeringRingFixedSide')} error={errors.centeringRingFixedSide} {...field} value={field.value ?? ''} />
          )} />
          <Controller name="centeringRingMovingSide" control={control} render={({ field }) => (
            <LabeledXtField id="centeringRingMovingSide" label={t('machine.form.centeringRingMovingSide')} error={errors.centeringRingMovingSide} {...field} value={field.value ?? ''} />
          )} />
          <Controller name="maxMoldWeight" control={control} render={({ field }) => (
            <LabeledXtField id="maxMoldWeight" label={t('machine.form.maxMoldWeight')} type="number" error={errors.maxMoldWeight} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />

          {sectionLabel(t('machine.form.sectionService'))}
          <Controller name="serviceInterval" control={control} render={({ field }) => (
            <LabeledXtField id="serviceInterval" label={t('machine.form.serviceInterval')} type="number" error={errors.serviceInterval} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
          )} />
          <Controller name="lastServiceDone" control={control} render={({ field }) => (
            <LabeledXtField id="lastServiceDone" label={t('machine.form.lastServiceDone')} type="date" error={errors.lastServiceDone} {...field} value={field.value ?? ''} />
          )} />

          {sectionLabel(t('machine.form.sectionCounters'))}
          <Controller name="workHoursCounter" control={control} render={({ field }) => (
            <LabeledXtField id="workHoursCounter" label={t('machine.form.workHoursCounter')} type="number" error={errors.workHoursCounter} {...field} value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} />
          )} />
          <Controller name="pieceCounter" control={control} render={({ field }) => (
            <LabeledXtField id="pieceCounter" label={t('machine.form.pieceCounter')} type="number" error={errors.pieceCounter} {...field} value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} />
          )} />
          <Controller name="scrapCounter" control={control} render={({ field }) => (
            <LabeledXtField id="scrapCounter" label={t('machine.form.scrapCounter')} type="number" error={errors.scrapCounter} {...field} value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} />
          )} />

          {sectionLabel(t('machine.form.sectionMedia'))}
          <ImageGallery
            galleryImages={pictures}
            onImagesSelected={handleImagesSelected}
            onImageRemove={handleImageRemove}
            isLoading={fileLoading}
          />
          {fileError && <Alert severity="error">{fileError}</Alert>}

          {sectionLabel(t('machine.form.sectionDocuments'))}
          <MachineDocumentUpload
            documents={documents}
            onChange={setDocuments}
            isLoading={fileLoading}
          />
        </Box>

        <Box sx={{ flexShrink: 0, pt: 2, pb: 2, px: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: theme.palette.background.default }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box display="flex" gap={2}>
            <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : undefined}>
              {loading ? t('machine.form.addSubmitLoading') : t('machine.form.addSubmit')}
            </Button>
            <Button variant="outlined" onClick={onCancel} disabled={loading} sx={{ color: theme.palette.primary[100], borderColor: theme.palette.primary[100], '&:hover': { borderColor: theme.palette.primary[200], backgroundColor: theme.palette.primary[100], color: theme.palette.common.white } }}>
              {t('machine.form.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddMachine;