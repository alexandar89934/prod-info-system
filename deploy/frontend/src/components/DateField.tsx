import { TextField, InputLabel, FormControl } from '@mui/material';
import { FieldError } from 'react-hook-form';

interface DateFieldProps {
  id: string;
  label: string;
  register: any;
  error?: FieldError;
  minWidth?: string;
}

export const DateField = ({
  id,
  label,
  register,
  error,
  minWidth = '150px',
}: DateFieldProps) => {
  return (
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
        variant="outlined"
        {...register(id)}
        error={!!error}
        helperText={error?.message}
        sx={{ flexGrow: 1 }}
        type="date"
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
      />
    </FormControl>
  );
};
