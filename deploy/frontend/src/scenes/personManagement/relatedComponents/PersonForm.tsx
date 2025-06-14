import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Control,
  Controller,
  FieldError,
  FieldErrors,
  UseFormHandleSubmit,
} from 'react-hook-form';

import DateField from '@/reusableComponents/DateField.tsx';
import DocumentList from '@/reusableComponents/DocumentsList.tsx';
import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField.tsx';
import EmployeeWorkplaceSelect from '@/scenes/personManagement/relatedComponents/EmployeeWorkplaceSelect.tsx';
import ProfileImageUpload from '@/scenes/personManagement/relatedComponents/ProfileImageUpload.tsx';
import UserRolesSelect from '@/scenes/personManagement/relatedComponents/UserRolesSelect.tsx';
import { PersonFormDataBase } from '@/state/person/person.types.ts';

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
  control: Control<any>;
  name: string;
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
          field.value === undefined || field.value === null ? '' : field.value
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
}: PersonFormProps) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ p: 2, overflowY: 'auto' }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        width="100%"
        maxWidth="800px"
        px={3}
        py={2}
        border="1px solid"
        borderColor="grey.300"
        borderRadius={2}
        boxShadow={1}
        sx={{
          backgroundColor: theme.palette.background.default,
          maxHeight: '80vh',
          overflowY: 'auto',
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
              label="Employee Number"
              type="number"
              error={errors.employeeNumber as FieldError}
            />
            <FormField
              control={control}
              name="name"
              label="Name"
              error={errors.name as FieldError}
            />
            <FormField
              control={control}
              name="address"
              label="Address"
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
            label="Mail"
            type="email"
            error={errors.mail as FieldError}
          />
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DateField
                id="startDate"
                label="Start Date"
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
                label="End Date"
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.endDate as FieldError}
              />
            )}
          />
          <FormField
            control={control}
            name="additionalInfo"
            label="Additional Info"
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
              minWidth: 150,
              position: 'relative',
              transform: 'none',
              mb: { xs: 1, sm: 0 },
            }}
          >
            Roles:
          </InputLabel>
          <UserRolesSelect control={control} name="roles" />
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
            htmlFor="workplaces"
            sx={{
              minWidth: 150,
              position: 'relative',
              transform: 'none',
              mb: { xs: 1, sm: 0 },
            }}
          >
            Workplaces:
          </InputLabel>
          <EmployeeWorkplaceSelect control={control} name="workplaces" />
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
            htmlFor="documents"
            sx={{
              minWidth: 150,
              position: 'relative',
              transform: 'none',
              mb: { xs: 1, sm: 0 },
            }}
          >
            Documents:
          </InputLabel>
          <DocumentList personId={personId} isEdit={isEdit} fullWidth />
        </FormControl>

        <Box
          mt={3}
          px={2}
          py={2}
          position="sticky"
          bottom={0}
          left={0}
          width="100%"
          zIndex={100}
          bgcolor={theme.palette.background.default}
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
              Back
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PersonForm;
