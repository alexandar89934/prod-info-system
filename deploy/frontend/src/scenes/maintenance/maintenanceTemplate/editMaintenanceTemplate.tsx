import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { useAppDispatch } from '@/state/hooks';
import {
  fetchMaintenanceTemplateById,
  updateMaintenanceTemplate,
} from '@/state/maintenanceTemplate/maintenanceTemplate.actions';
import {
  selectCurrentMaintenanceTemplate,
  selectMaintenanceTemplateError,
  selectMaintenanceTemplateLoading,
} from '@/state/maintenanceTemplate/maintenanceTemplate.selectors';
import { clearError, resetState } from '@/state/maintenanceTemplate/maintenanceTemplate.slice';
import {
  MaintenanceTemplateFormData,
  maintenanceTemplateSchema,
} from '@/zodValidationSchemas/maintenanceTemplate.schema';

const TARGET_TYPES = ['machine', 'equipment', 'mold', 'vehicle'] as const;
const INTERVAL_TYPES = ['days', 'injections', 'on_demand'] as const;

const EditMaintenanceTemplate = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const loading = useSelector(selectMaintenanceTemplateLoading);
  const error = useSelector(selectMaintenanceTemplateError);
  const current = useSelector(selectCurrentMaintenanceTemplate);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MaintenanceTemplateFormData>({
    resolver: zodResolver(maintenanceTemplateSchema),
    defaultValues: {
      name: '',
      targetType: 'machine',
      intervalType: 'days',
      intervalValue: null,
      notes: '',
      steps: [{ stepOrder: 1, description: '', isRequired: true }],
    },
  });

  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: 'steps',
  });

  const intervalType = watch('intervalType');

  useEffect(() => {
    if (id) dispatch(fetchMaintenanceTemplateById(id));
    return () => { dispatch(resetState()); };
  }, [dispatch, id]);

  useEffect(() => {
    if (current) {
      reset({
        name: current.name,
        targetType: current.targetType as MaintenanceTemplateFormData['targetType'],
        intervalType: current.intervalType as MaintenanceTemplateFormData['intervalType'],
        intervalValue: current.intervalValue ?? null,
        notes: current.notes ?? '',
        steps: (current.steps && current.steps.length > 0)
          ? current.steps.map((s) => ({
              stepOrder: s.stepOrder,
              description: s.description,
              isRequired: s.isRequired,
            }))
          : [{ stepOrder: 1, description: '', isRequired: true }],
      });
    }
  }, [current, reset]);

  useEffect(() => {
    if (intervalType === 'on_demand') {
      setValue('intervalValue', null);
    }
  }, [intervalType, setValue]);

  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const onSubmit = async (data: MaintenanceTemplateFormData) => {
    if (!id) return;
    const steps = data.steps.map((step, idx) => ({
      stepOrder: idx + 1,
      description: step.description ?? '',
      isRequired: step.isRequired ?? false,
    }));
    const result = await dispatch(
      updateMaintenanceTemplate({
        id,
        name: data.name,
        targetType: data.targetType,
        intervalType: data.intervalType,
        intervalValue: data.intervalValue ?? null,
        notes: data.notes ?? null,
        steps,
      })
    );
    if (updateMaintenanceTemplate.fulfilled.match(result)) navigate('/maintenance-template');
  };

  const sectionLabel = (text: string) => (
    <Typography
      variant="subtitle2"
      color="text.secondary"
      sx={{ mt: 2, mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}
    >
      {text}
    </Typography>
  );

  const cancelSx = {
    color: theme.palette.primary[100],
    borderColor: theme.palette.primary[100],
    '&:hover': {
      borderColor: theme.palette.primary[200],
      backgroundColor: theme.palette.primary[100],
      color: theme.palette.common.white,
    },
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%" sx={{ p: 2, overflow: 'hidden' }}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        width="100%"
        maxWidth="860px"
        p={3}
        border="1px solid"
        borderColor="grey.300"
        borderRadius={2}
        boxShadow={1}
        sx={{
          backgroundColor: theme.palette.background.default,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h4" align="center" mb={1}>
          {t('maintenanceTemplate.edit')}
        </Typography>

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
          {sectionLabel(t('maintenanceTemplate.name'))}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                fullWidth
                label={t('maintenanceTemplate.name')}
                value={field.value}
                onChange={field.onChange}
                error={!!errors.name}
                helperText={errors.name?.message}
                margin="normal"
                size="small"
              />
            )}
          />

          <Box display="flex" gap={2} flexWrap="wrap">
            <FormControl margin="normal" sx={{ minWidth: 200, flex: 1 }} error={!!errors.targetType}>
              <InputLabel>{t('maintenanceTemplate.targetType')}</InputLabel>
              <Controller
                name="targetType"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('maintenanceTemplate.targetType')}
                    value={field.value}
                    onChange={(e: SelectChangeEvent) => field.onChange(e.target.value)}
                    size="small"
                  >
                    {TARGET_TYPES.map((tt) => (
                      <MenuItem key={tt} value={tt}>
                        {t(`maintenanceTemplate.targetTypes.${tt}`)}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.targetType && <FormHelperText>{errors.targetType.message}</FormHelperText>}
            </FormControl>

            <FormControl margin="normal" sx={{ minWidth: 200, flex: 1 }} error={!!errors.intervalType}>
              <InputLabel>{t('maintenanceTemplate.intervalType')}</InputLabel>
              <Controller
                name="intervalType"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('maintenanceTemplate.intervalType')}
                    value={field.value}
                    onChange={(e: SelectChangeEvent) => field.onChange(e.target.value)}
                    size="small"
                  >
                    {INTERVAL_TYPES.map((it) => (
                      <MenuItem key={it} value={it}>
                        {t(`maintenanceTemplate.intervalTypes.${it}`)}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.intervalType && <FormHelperText>{errors.intervalType.message}</FormHelperText>}
            </FormControl>

            {intervalType !== 'on_demand' && (
              <Controller
                name="intervalValue"
                control={control}
                render={({ field }) => (
                  <TextField
                    label={t('maintenanceTemplate.intervalValue')}
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    error={!!errors.intervalValue}
                    helperText={errors.intervalValue?.message}
                    margin="normal"
                    size="small"
                    sx={{ minWidth: 140, flex: 1 }}
                    inputProps={{ min: 1 }}
                  />
                )}
              />
            )}
          </Box>

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                fullWidth
                label={t('maintenanceTemplate.notes')}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={!!errors.notes}
                helperText={errors.notes?.message}
                margin="normal"
                size="small"
                multiline
                rows={3}
              />
            )}
          />

          {sectionLabel(t('maintenanceTemplate.steps'))}
          {errors.steps && !Array.isArray(errors.steps) && (
            <FormHelperText error sx={{ mb: 1 }}>
              {errors.steps.message}
            </FormHelperText>
          )}

          {fields.map((field, index) => (
            <Box
              key={field.id}
              display="flex"
              alignItems="center"
              gap={1}
              mb={1}
              p={1}
              border="1px solid"
              borderColor="divider"
              borderRadius={1}
            >
              <Typography variant="caption" sx={{ minWidth: 24, fontWeight: 700, color: 'text.secondary' }}>
                {index + 1}.
              </Typography>

              <Controller
                name={`steps.${index}.description`}
                control={control}
                render={({ field: descField }) => (
                  <TextField
                    value={descField.value}
                    onChange={descField.onChange}
                    placeholder={t('maintenanceTemplate.stepDescription')}
                    size="small"
                    sx={{ flex: 1 }}
                    error={!!errors.steps?.[index]?.description}
                    helperText={errors.steps?.[index]?.description?.message}
                  />
                )}
              />

              <Controller
                name={`steps.${index}.isRequired`}
                control={control}
                render={({ field: reqField }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={reqField.value}
                        onChange={(e) => reqField.onChange(e.target.checked)}
                        size="small"
                      />
                    }
                    label={t('maintenanceTemplate.isRequired')}
                    sx={{ mr: 0, whiteSpace: 'nowrap' }}
                  />
                )}
              />

              <IconButton
                size="small"
                disabled={index === 0}
                onClick={() => swap(index, index - 1)}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                disabled={index === fields.length - 1}
                onClick={() => swap(index, index + 1)}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() =>
              append({ stepOrder: fields.length + 1, description: '', isRequired: true })
            }
            sx={{ alignSelf: 'flex-start', mt: 1 }}
          >
            {t('maintenanceTemplate.addStep')}
          </Button>
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
          <Box display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
            >
              {loading ? `${t('maintenanceTemplate.edit')}...` : t('maintenanceTemplate.edit')}
            </Button>
            <Button
              variant="outlined"
              disabled={loading}
              onClick={() => navigate('/maintenance-template')}
              sx={cancelSx}
            >
              {t('common.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditMaintenanceTemplate;