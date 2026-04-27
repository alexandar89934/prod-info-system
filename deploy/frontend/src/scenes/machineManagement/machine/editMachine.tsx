import { zodResolver } from '@hookform/resolvers/zod';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  TextField,
  Tooltip,
  useTheme,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import axiosServer from '@/services/axios.service';
import { AttachedEquipment } from '@/state/machine/machine.types';

import Header from '@/reusableComponents/Header';
import ImageGallery from '@/reusableComponents/ImageGallery.tsx';
import { LabeledXtSelect } from '@/reusableComponents/LabeledSelectField.tsx';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import MachineDocumentUpload from '@/reusableComponents/MachineDocumentUpload.tsx';
import { getName } from '@/state/auth/auth.selectors.ts';
import { useAppDispatch } from '@/state/hooks';
import { fetchMachineById, updateMachine } from '@/state/machine/machine.actions.ts';
import { selectCurrentMachine } from '@/state/machine/machine.selectors.ts';
import { EditMachineFormData } from '@/state/machine/machine.types.ts';
import { machineSchema } from '@/zodValidationSchemas/machine.schema.ts';

import { useMachineForm } from './useMachineForm';

const EditMachine = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const currentMachine = useSelector(selectCurrentMachine);

  const {
    availabilityStatuses,
    pictures,
    setPictures,
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
  } = useForm<EditMachineFormData>({
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
    },
  });

  useEffect(() => {
    if (id) dispatch(fetchMachineById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!currentMachine) return;
    reset({
      ...currentMachine,
      lastServiceDone: currentMachine.lastServiceDone
        ? new Date(currentMachine.lastServiceDone).toISOString().split('T')[0]
        : null,
    });
    if (currentMachine.pictures) {
      setPictures(
        currentMachine.pictures.map((p) => ({
          name: p.name,
          path: p.path,
          dateAdded: p.dateAdded instanceof Date ? p.dateAdded.toISOString() : String(p.dateAdded),
        }))
      );
    }
    if (currentMachine.documents) {
      setDocuments(
        currentMachine.documents.map((d) => ({
          name: d.name,
          path: d.path,
          dateAdded: d.dateAdded instanceof Date ? d.dateAdded.toISOString() : String(d.dateAdded),
        }))
      );
    }
    setAttachedEquipment(currentMachine.attachedEquipment ?? []);
  }, [currentMachine, reset, setPictures, setDocuments]);

  const [attachedEquipment, setAttachedEquipment] = useState<AttachedEquipment[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [unassignedEquipment, setUnassignedEquipment] = useState<AttachedEquipment[]>([]);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [equipmentOpLoading, setEquipmentOpLoading] = useState(false);

  const fetchUnassigned = async (search = '') => {
    setDialogLoading(true);
    try {
      const res = await axiosServer.get('/machine-equipment/unassigned', { params: { search } });
      if (res.data.success) setUnassignedEquipment(res.data.content.equipments);
    } finally {
      setDialogLoading(false);
    }
  };

  const openAssignDialog = () => {
    setEquipmentSearch('');
    setAssignDialogOpen(true);
    fetchUnassigned('');
  };

  const handleEquipmentAssign = async (eq: AttachedEquipment) => {
    if (!id) return;
    setEquipmentOpLoading(true);
    try {
      const res = await axiosServer.post(`/machine-equipment/assign/${eq.id}`, { machineId: id });
      if (res.data.success) {
        setAttachedEquipment((prev) => [...prev, eq]);
        setAssignDialogOpen(false);
      }
    } finally {
      setEquipmentOpLoading(false);
    }
  };

  const handleEquipmentUnassign = async (equipmentId: number) => {
    setEquipmentOpLoading(true);
    try {
      const res = await axiosServer.delete(`/machine-equipment/unassign/${equipmentId}`);
      if (res.data.success) {
        setAttachedEquipment((prev) => prev.filter((e) => e.id !== equipmentId));
      }
    } finally {
      setEquipmentOpLoading(false);
    }
  };

  const onSubmit = async (data: EditMachineFormData) => {
    if (!id) return;
    const result = await dispatch(updateMachine({ ...data, id, pictures: picturesToSubmit, documents: documentsToSubmit, updatedBy: getName() ?? '' }));
    if (updateMachine.fulfilled.match(result)) {
      navigate('/machine');
    }
  };

  const onCancel = () => navigate('/machine');

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
        <Header title={t('machine.form.editTitle')} subtitle="" />

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

          {sectionLabel(t('machine.detail.attachedEquipment'))}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button variant="outlined" color="secondary" size="small" onClick={openAssignDialog}>
              {t('machine.detail.addEquipment')}
            </Button>
          </Box>
          {attachedEquipment.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('machine.detail.noAttachedEquipment')}
            </Typography>
          ) : (
            attachedEquipment.map((eq) => (
              <Box
                key={eq.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.75,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500}>{eq.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {[eq.equipmentTypeName, eq.model, eq.serialNumber].filter(Boolean).join(' · ')}
                  </Typography>
                </Box>
                <Tooltip title={t('machine.detail.unassign')}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleEquipmentUnassign(eq.id)}
                    disabled={equipmentOpLoading}
                  >
                    <LinkOffIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))
          )}
        </Box>

        <Box sx={{ flexShrink: 0, pt: 2, pb: 2, px: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: theme.palette.background.default }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box display="flex" gap={2}>
            <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : undefined}>
              {loading ? t('machine.form.saveChangesLoading') : t('machine.form.saveChanges')}
            </Button>
            <Button variant="outlined" onClick={onCancel} disabled={loading} sx={{ color: theme.palette.primary[100], borderColor: theme.palette.primary[100], '&:hover': { borderColor: theme.palette.primary[200], backgroundColor: theme.palette.primary[100], color: theme.palette.common.white } }}>
              {t('machine.form.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>

      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('machine.detail.assignDialogTitle')}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('machine.detail.searchEquipment')}
            value={equipmentSearch}
            onChange={(e) => { setEquipmentSearch(e.target.value); fetchUnassigned(e.target.value); }}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          {dialogLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={28} />
            </Box>
          ) : unassignedEquipment.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              {t('machine.detail.noUnassignedEquipment')}
            </Typography>
          ) : (
            <List disablePadding>
              {unassignedEquipment.map((eq) => (
                <ListItem
                  key={eq.id}
                  disablePadding
                  sx={{ py: 0.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}
                  secondaryAction={
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleEquipmentAssign(eq)}
                      disabled={equipmentOpLoading}
                    >
                      {t('machine.detail.assign')}
                    </Button>
                  }
                >
                  <ListItemText
                    primary={eq.name}
                    secondary={[eq.equipmentTypeName, eq.model, eq.serialNumber].filter(Boolean).join(' · ')}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EditMachine;