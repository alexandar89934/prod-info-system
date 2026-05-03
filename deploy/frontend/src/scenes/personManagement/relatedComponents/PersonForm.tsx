import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Control,
  Controller,
  FieldError,
  FieldErrors,
  FieldValues,
  Path,
  UseFormHandleSubmit,
  useWatch,
} from 'react-hook-form';

import { useSelector } from 'react-redux';

import DateField from '@/reusableComponents/DateField.tsx';
import DocumentList from '@/reusableComponents/DocumentsList.tsx';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField.tsx';
import EmployeeJobPositionSelect from '@/scenes/personManagement/relatedComponents/EmployeeJobPositionSelect.tsx';
import ProfileImageUpload from '@/scenes/personManagement/relatedComponents/ProfileImageUpload.tsx';
import UserRolesSelect from '@/scenes/personManagement/relatedComponents/UserRolesSelect.tsx';
import { selectJobPositions } from '@/state/jobPosition/jobPosition.selectors.ts';
import { PersonFormDataBase, PersonStatus } from '@/state/person/person.types.ts';

interface PersonFormProps {
  title: string;
  control: Control<PersonFormDataBase>;
  errors: FieldErrors<PersonFormDataBase>;
  onSubmit: (data: PersonFormDataBase) => void;
  handleSubmit: UseFormHandleSubmit<PersonFormDataBase>;
  loading: boolean;
  error: string | null;
  success: string | null;
  onCancel: () => void;
  submitButtonText: string;
  imagePath: string | null;
  onImageUpload: (uploadedPath: string) => void;
  personId?: string;
  isEdit?: boolean;
  children?: React.ReactNode;
}

const FormField = ({
  control,
  name,
  label,
  type = 'text',
  error,
  multiline = false,
  rows = 1,
}: {
  control: Control<PersonFormDataBase>;
  name: Path<PersonFormDataBase>;
  label: string;
  type?: 'number' | 'text' | 'email' | 'password' | 'string';
  error?: FieldError;
  multiline?: boolean;
  rows?: number;
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <LabeledXtField
        id={name}
        label={label}
        type={type}
        value={
          field.value === undefined || field.value === null
            ? ''
            : String(field.value)
        }
        onChange={(e) => {
          if (type === 'number') {
            const numValue =
              e.target.value === '' ? undefined : Number(e.target.value);
            field.onChange(numValue);
            return;
          }
          field.onChange(e.target.value);
        }}
        error={error}
        multiline={multiline}
        rows={rows}
      />
    )}
  />
);

const STATUS_COLORS: Record<PersonStatus, 'success' | 'default' | 'primary' | 'warning' | 'info'> = {
  working: 'success',
  off: 'default',
  vacation: 'primary',
  sick: 'warning',
  break: 'info',
};

const PersonForm = ({
  title,
  control,
  errors,
  onSubmit,
  handleSubmit,
  loading,
  error,
  success,
  onCancel,
  submitButtonText,
  imagePath,
  onImageUpload,
  personId,
  isEdit = false,
  children,
}: PersonFormProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const allJobPositions = useSelector(selectJobPositions);
  const selectedJobPositionIds = useWatch({ control, name: 'jobPositions' }) as number[];
  const eligiblePositions = allJobPositions.filter((jp) =>
    (selectedJobPositionIds ?? []).includes(jp.id)
  );

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
        maxWidth="950px"
        px={3}
        py={2}
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
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.primary.main,
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.background.default,
            },
          }}
        >
          <Typography variant="h4" align="center" mb={2}>
            {title}
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={2}>
            <Box flex="1 1 65%" display="flex" flexDirection="column" gap={2}>
              <FormField
                control={control}
                name="employeeNumber"
                label={t('person.form.employeeNumber')}
                type="number"
                error={errors.employeeNumber as FieldError}
              />
              <FormField
                control={control}
                name="name"
                label={t('person.form.name')}
                error={errors.name as FieldError}
              />
              <FormField
                control={control}
                name="address"
                label={t('person.form.address')}
                error={errors.address as FieldError}
              />
            </Box>

            <Box flex="1 1 25%" display="flex" justifyContent="center">
              <ProfileImageUpload
                profilePicture={imagePath}
                personId={personId}
                onImageUpload={onImageUpload}
              />
            </Box>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
            <FormField
              control={control}
              name="mail"
              label={t('person.form.mail')}
              type="email"
              error={errors.mail as FieldError}
            />
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DateField
                  id="startDate"
                  label={t('person.form.startDate')}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={errors.startDate as FieldError}
                />
              )}
            />
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DateField
                  id="endDate"
                  label={t('person.form.endDate')}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={errors.endDate as FieldError}
                />
              )}
            />
            <FormField
              control={control}
              name="additionalInfo"
              label={t('person.form.additionalInfo')}
              error={errors.additionalInfo as FieldError}
              multiline
              rows={4}
            />
          </Box>

          <FormControl
            fullWidth
            margin="normal"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: 2,
            }}
          >
            <InputLabel
              htmlFor="roles"
              sx={{
                minWidth: 220,
                position: 'relative',
                transform: 'none',
                mb: { xs: 1, sm: 0 },
              }}
            >
              {t('person.form.roles')}
            </InputLabel>
            <UserRolesSelect control={control as unknown as Control<FieldValues>} name="roles" />
          </FormControl>
          <FormControl
            fullWidth
            margin="normal"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: 2,
            }}
          >
            <InputLabel
              htmlFor="jobPositions"
              sx={{
                minWidth: 220,
                position: 'relative',
                transform: 'none',
                mb: { xs: 1, sm: 0 },
              }}
            >
              {t('person.form.jobPositions')}
            </InputLabel>
            <EmployeeJobPositionSelect control={control} name="jobPositions" />
          </FormControl>

          <FormField
            control={control}
            name="rfidCardNumber"
            label={t('person.form.rfidCardNumber')}
            error={errors.rfidCardNumber as FieldError}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="status-label">{t('person.form.status')}</InputLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  labelId="status-label"
                  id="status"
                  value={field.value ?? 'off'}
                  label={t('person.form.status')}
                  onChange={(e: SelectChangeEvent) => field.onChange(e.target.value as PersonStatus)}
                  renderValue={(selected) => (
                    <Chip
                      label={t(`person.status.${selected}`)}
                      color={STATUS_COLORS[selected as PersonStatus] ?? 'default'}
                      size="small"
                    />
                  )}
                >
                  {(['working', 'off', 'vacation', 'sick', 'break'] as PersonStatus[]).map((s) => (
                    <MenuItem key={s} value={s}>
                      <Chip
                        label={t(`person.status.${s}`)}
                        color={STATUS_COLORS[s]}
                        size="small"
                        sx={{ cursor: 'pointer' }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="currentPosition-label" shrink>{t('person.form.currentPosition')}</InputLabel>
            <Controller
              name="currentPositionId"
              control={control}
              render={({ field }) => (
                <Select
                  labelId="currentPosition-label"
                  id="currentPositionId"
                  value={field.value != null ? String(field.value) : ''}
                  label={t('person.form.currentPosition')}
                  notched
                  onChange={(e: SelectChangeEvent) =>
                    field.onChange(e.target.value === '' ? null : Number(e.target.value))
                  }
                  displayEmpty
                  disabled={eligiblePositions.length === 0}
                >
                  <MenuItem value="">
                    <em>
                      {eligiblePositions.length === 0
                        ? t('person.form.currentPositionHint')
                        : '—'}
                    </em>
                  </MenuItem>
                  {eligiblePositions.map((jp) => (
                    <MenuItem key={jp.id} value={String(jp.id)}>
                      {jp.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mt: 2, mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}
          >
            {t('person.form.documents')}
          </Typography>
          <DocumentList personId={personId} isEdit={isEdit} fullWidth />
          {children}
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
              color="primary"
              disabled={loading}
              sx={{ color: theme.palette.primary[200] }}
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {loading ? `${submitButtonText}...` : submitButtonText}
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
              {t('person.form.back')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PersonForm;
