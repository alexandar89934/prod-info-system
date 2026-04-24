import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, Alert, useTheme } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Header from '@/reusableComponents/Header';
import ImageGallery from '@/reusableComponents/ImageGallery.tsx';
import { LabeledXtSelect } from '@/reusableComponents/LabeledSelectField.tsx';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import { getName } from '@/state/auth/auth.selectors.ts';
import { useAppDispatch } from '@/state/hooks';
import { addMachineEquipment } from '@/state/machineEquipment/machineEquipment.actions.ts';
import { AddMachineEquipmentFormData } from '@/state/machineEquipment/machineEquipment.types.ts';
import { machineEquipmentSchema } from '@/zodValidationSchemas/machineEquipment.schema.ts';

import { useMachineEquipmentForm } from './useMachineEquipmentForm';

const AddMachineEquipment = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    types,
    pictures,
    picturesToSubmit,
    fileLoading,
    fileError,
    loading,
    error,
    success,
    handleImagesSelected,
    handleImageRemove,
  } = useMachineEquipmentForm();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMachineEquipmentFormData>({
    resolver: zodResolver(machineEquipmentSchema),
    defaultValues: {
      name: '',
      model: '',
      serialNumber: '',
      type: 0,
      description: '',
      createdBy: getName(),
    },
  });

  const onSubmit = async (data: AddMachineEquipmentFormData) => {
    const result = await dispatch(
      addMachineEquipment({ ...data, pictures: picturesToSubmit })
    );
    if (addMachineEquipment.fulfilled.match(result)) {
      reset();
      navigate('/machineEquipment');
    }
  };

  const onCancel = () => {
    reset();
    navigate('/machineEquipment');
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
        <Header title={t('machineEquipment.form.addTitle')} subtitle="" />
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
                options={types.map((t) => ({ value: t.id, label: t.name }))}
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
              {loading ? t('machineEquipment.form.addSubmitLoading') : t('machineEquipment.form.addSubmit')}
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

export default AddMachineEquipment;