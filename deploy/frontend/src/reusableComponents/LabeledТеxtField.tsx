import { TextField, InputLabel, FormControl, useTheme } from '@mui/material';
import { FieldError } from 'react-hook-form';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'number' | 'text' | 'email' | 'password' | 'string';
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: FieldError;
  multiline?: boolean;
  rows?: number;
  minWidth?: string;
  fullWidth?: boolean;
}

export const LabeledXtField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  multiline = false,
  rows = 1,
  minWidth = '150px',
  fullWidth = true,
}: FormFieldProps) => {
  const theme = useTheme();

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
        value={value}
        onChange={onChange}
        variant="outlined"
        error={!!error}
        helperText={error?.message}
        multiline={multiline}
        rows={rows}
        fullWidth={fullWidth}
        sx={{
          '& textarea': {
            maxHeight: '25vh',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.primary.main,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.background.default,
            },
          },
        }}
      />
    </FormControl>
  );
};
