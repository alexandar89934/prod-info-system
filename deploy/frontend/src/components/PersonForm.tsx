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
  FieldError,
  FieldErrors,
  UseFormHandleSubmit,
} from 'react-hook-form';

import { DateField } from './DateField';
import DocumentList from './DocumentsList';
import ProfileImageUpload from './ProfileImageUpload';
import UserRolesSelect from './UserRolesSelect';

import { LabeledXtField } from '@/components/LabeledТеxtField.tsx';
import { PersonFormDataBase } from '@/state/person/person.types';

interface PersonFormProps<T extends PersonFormDataBase> {
  title: string;
  control: Control<T>;
  errors: FieldErrors<T>;
  register: any;
  onSubmit: (data: T) => void;
  handleSubmit: UseFormHandleSubmit<T>;
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

const PersonForm = <T extends PersonFormDataBase>({
  title,
  control,
  errors,
  register,
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
}: PersonFormProps<T>) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{ padding: 2, overflowY: 'auto' }}
    >
      <Box
        width="100%"
        maxWidth="800px"
        paddingLeft={3}
        paddingRight={3}
        border="1px solid"
        borderColor="grey.300"
        borderRadius={2}
        boxShadow={1}
        sx={{
          backgroundColor: theme.palette.background.default,
          maxHeight: '80vh',
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main,
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          align="center"
          mb={2}
          mt={2}
          sx={{ fontSize: '2.125rem' }}
        >
          {title}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box
              sx={{
                flex: '1 1 65%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <LabeledXtField
                id="employeeNumber"
                label="Employee Number"
                type="number"
                register={register}
                error={errors.employeeNumber as FieldError}
                valueAsNumber
              />

              <LabeledXtField
                id="name"
                label="Name"
                register={register}
                error={errors.name as FieldError}
              />

              <LabeledXtField
                id="address"
                label="Address"
                register={register}
                error={errors.address as FieldError}
              />
            </Box>

            <Box
              sx={{
                flex: '1 1 25%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <FormControl
                fullWidth
                margin="normal"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <ProfileImageUpload
                  profilePicture={imagePath}
                  personId={personId}
                  onImageUpload={onImageUpload}
                />
              </FormControl>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <LabeledXtField
              id="mail"
              label="Mail"
              type="email"
              register={register}
              error={errors.mail as FieldError}
            />

            <DateField
              id="startDate"
              label="Start Date"
              register={register}
              error={errors.startDate as FieldError}
            />

            <DateField
              id="endDate"
              label="End Date"
              register={register}
              error={errors.endDate as FieldError}
            />

            <LabeledXtField
              id="additionalInfo"
              label="Additional Info"
              register={register}
              error={errors.additionalInfo as FieldError}
              multiline
              rows={4}
            />

            <FormControl
              fullWidth
              margin="normal"
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1, sm: 2 },
              }}
            >
              <InputLabel
                htmlFor="roles"
                sx={{
                  minWidth: '150px',
                  position: 'relative',
                  transform: 'none',
                  marginBottom: { xs: 1, sm: 0 },
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
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1, sm: 2 },
              }}
            >
              <InputLabel
                htmlFor="documents"
                sx={{
                  minWidth: '150px',
                  position: 'relative',
                  transform: 'none',
                  marginBottom: { xs: 1, sm: 0 },
                }}
              >
                Documents:
              </InputLabel>

              <DocumentList personId={personId} isEdit={isEdit} fullWidth />
            </FormControl>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              padding: 2,
              backgroundColor: theme.palette.background.default,
              position: 'sticky',
              bottom: 0,
              left: 0,
              width: '100%',
              zIndex: 100,
            }}
          >
            {error ? (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {error}
              </Alert>
            ) : null}

            {success ? (
              <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
                {success}
              </Alert>
            ) : null}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                width: '100%',
              }}
            >
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{
                  color: theme.palette.primary[200],
                  width: 'auto',
                }}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
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
                  width: 'auto',
                }}
              >
                Back
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default PersonForm;
