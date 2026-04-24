import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, Alert, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/reusableComponents/Header';
import ImageGallery, {
  GalleryImage,
} from '@/reusableComponents/ImageGallery.tsx';
import { LabeledXtSelect } from '@/reusableComponents/LabeledSelectField.tsx';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import { getName } from '@/state/auth/auth.selectors.ts';
import {
  uploadSingleFile,
  deleteFileMachineEquipment,
} from '@/state/fileUploads/files.actions.ts';
import {
  selectLoading as selectFileLoading,
  selectError as selectFileError,
} from '@/state/fileUploads/files.selectors.ts';
import { useAppDispatch } from '@/state/hooks';
import {
  fetchMachineEquipmentById,
  updateMachineEquipment,
} from '@/state/machineEquipment/machineEquipment.actions.ts';
import {
  selectCurrentMachineEquipment,
  selectMachineEquipmentLoading as selectLoading,
  selectMachineEquipmentError as selectError,
  selectMachineEquipmentSuccess as selectSuccess,
} from '@/state/machineEquipment/machineEquipment.selectors.ts';
import {
  clearError,
  clearSuccess,
} from '@/state/machineEquipment/machineEquipment.slice.ts';
import { EditMachineEquipmentFormData } from '@/state/machineEquipment/machineEquipment.types.ts';
import { fetchMachineEquipmentTypes } from '@/state/machineEquipmentTypes/machineEquipmentTypes.actions.ts';
import { selectMachineEquipmentTypes } from '@/state/machineEquipmentTypes/machineEquipmentTypes.selectors.ts';
import { MachineEquipmentType } from '@/state/machineEquipmentTypes/machineEquipmentTypes.types.ts';
import { machineEquipmentSchema } from '@/zodValidationSchemas/machineEquipment.schema.ts';

const EditMachineEquipment = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const success = useSelector(selectSuccess);
  const fileLoading = useSelector(selectFileLoading);
  const fileError = useSelector(selectFileError);
  const equipment = useSelector(selectCurrentMachineEquipment);
  const types: MachineEquipmentType[] = useSelector(selectMachineEquipmentTypes);

  const [pictures, setPictures] = useState<GalleryImage[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm<EditMachineEquipmentFormData>({
    resolver: zodResolver(machineEquipmentSchema),
    defaultValues: {
      name: '',
      model: '',
      serialNumber: '',
      type: 0,
      description: '',
    },
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchMachineEquipmentById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(
      fetchMachineEquipmentTypes({
        page: 1,
        limit: 100,
        search: '',
        sortField: '',
        sortOrder: '',
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (equipment) {
      reset({
        id: equipment.id,
        name: equipment.name ?? '',
        model: equipment.model ?? '',
        serialNumber: equipment.serialNumber ?? '',
        type: equipment.type ?? 0,
        description: equipment.description ?? '',
        updatedBy: getName(),
      });

      const existingPictures: GalleryImage[] = (equipment.pictures ?? []).map(
        (p) => ({
          name: p.name,
          path: p.path,
          dateAdded: p.dateAdded,
        })
      );
      setPictures(existingPictures);
    }
  }, [equipment, reset]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearError());
      dispatch(clearSuccess());
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, success, dispatch]);

  const onSubmit = async (data: EditMachineEquipmentFormData) => {
    const result = await dispatch(
      updateMachineEquipment({
        ...data,
        pictures: pictures.map((p) => ({
          name: p.name,
          path: p.path,
          dateAdded: new Date(p.dateAdded as string),
        })),
      })
    );
    if (updateMachineEquipment.fulfilled.match(result)) {
      navigate('/machineEquipment');
    }
  };

  const onCancel = () => navigate('/machineEquipment');

  const handleImagesSelected = async (files: FileList) => {
    try {
      const uploads = await Promise.all(
        Array.from(files).map((file) => {
          const formData = new FormData();
          formData.append('uploadSingleFile', file);
          return dispatch(uploadSingleFile(formData)).unwrap();
        })
      );
      setPictures((prev) => [
        ...prev,
        ...uploads.map((payload) => ({
          name: payload.name,
          path: payload.path,
          dateAdded: new Date().toISOString(),
        })),
      ]);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleImageRemove = async (image: GalleryImage) => {
    try {
      await dispatch(
        deleteFileMachineEquipment({ documentPath: image.path })
      ).unwrap();
      setPictures((prev) => prev.filter((pic) => pic.path !== image.path));
    } catch (err) {
      console.error('Delete failed:', err);
    }
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
        maxWidth="600px"
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
        <Header title={t('machineEquipment.form.editTitle')} subtitle="" />
        <input
          type="hidden"
          value={equipment?.id ?? ''}
          {...register('id', { valueAsNumber: true })}
        />
        <Box sx={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', display: 'flex', flexDirection: 'column', gap: 2, pb: 2, '&::-webkit-scrollbar': { width: 8 }, '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.primary.main, borderRadius: 4 }, '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.background.default } }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <LabeledXtField
                id="name"
                label={t('machineEquipment.form.name')}
                error={errors.name}
                {...field}
              />
            )}
          />

          <ImageGallery
            galleryImages={pictures}
            onImagesSelected={handleImagesSelected}
            onImageRemove={handleImageRemove}
            isLoading={fileLoading}
          />
          {fileError && <Alert severity="error">{fileError}</Alert>}

          <Controller
            name="model"
            control={control}
            render={({ field }) => (
              <LabeledXtField
                id="model"
                label={t('machineEquipment.form.model')}
                error={errors.model}
                {...field}
                value={field.value ?? ''}
              />
            )}
          />
          <Controller
            name="serialNumber"
            control={control}
            render={({ field }) => (
              <LabeledXtField
                id="serialNumber"
                label={t('machineEquipment.form.serialNumber')}
                error={errors.serialNumber}
                {...field}
              />
            )}
          />
          <Controller
            name="type"
            control={control}
            render={({ field, fieldState }) => (
              <LabeledXtSelect
                id="type"
                label={t('machineEquipment.form.equipmentType')}
                value={field.value ?? ''}
                onChange={(eventOrValue) => {
                  const newValue =
                    typeof eventOrValue === 'number' ||
                    typeof eventOrValue === 'string'
                      ? eventOrValue
                      : (eventOrValue.target.value as number);
                  field.onChange(Number(newValue));
                }}
                error={fieldState.error}
                options={types.map((type) => ({
                  value: type.id,
                  label: type.name,
                }))}
                disabledDefaultText={t('machineEquipment.form.selectType')}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <LabeledXtField
                id="description"
                label={t('machineEquipment.form.description')}
                multiline
                rows={4}
                error={errors.description}
                {...field}
                value={field.value ?? ''}
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
              {loading ? t('machineEquipment.form.saveChangesLoading') : t('machineEquipment.form.saveChanges')}
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
              {t('machineEquipment.form.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditMachineEquipment;