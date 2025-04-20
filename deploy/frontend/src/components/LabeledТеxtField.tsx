import { TextField, InputLabel, FormControl } from '@mui/material';
import { FieldError } from 'react-hook-form';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'password';
  register: any;
  error?: FieldError;
  multiline?: boolean;
  rows?: number;
  minWidth?: string;
  fullWidth?: boolean;
  valueAsNumber?: boolean;
}

export const LabeledXtField = ({
  id,
  label,
  type = 'text',
  register,
  error,
  multiline = false,
  rows = 1,
  minWidth = '150px',
  fullWidth = true,
}: FormFieldProps) => {
  return (
    <FormControl
      fullWidth={fullWidth}
      margin="normal"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 1, sm: 2 },
      }}
    >
      <InputLabel
        htmlFor={id}
        sx={{
          minWidth,
          position: 'relative',
          transform: 'none',
          marginBottom: { xs: 1, sm: 0 },
        }}
      >
        {label}:
      </InputLabel>
      <TextField
        id={id}
        type={type}
        variant="outlined"
        {...register(
          id,
          type === 'number' ? { valueAsNumber: true } : undefined
        )}
        error={!!error}
        helperText={error?.message}
        sx={{
          flexGrow: 1,
        }}
        multiline={multiline}
        rows={rows}
        fullWidth={fullWidth}
      />
    </FormControl>
  );
};
