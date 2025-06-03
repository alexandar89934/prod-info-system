import { TextField, InputLabel, FormControl } from '@mui/material';
import { FieldError } from 'react-hook-form';

interface DateFieldProps {
  id: string;
  label: string;
  value: string | number | Date | number[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: FieldError;
  minWidth?: string;
  fullWidth?: boolean;
}

export const DateField = ({
  id,
  label,
  value,
  onChange,
  error,
  minWidth = '150px',
  fullWidth = true,
}: DateFieldProps) => {
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
        type="date"
        value={value}
        onChange={onChange}
        variant="outlined"
        error={!!error}
        helperText={error?.message}
        fullWidth={fullWidth}
        InputLabelProps={{
          shrink: true,
        }}
      />
    </FormControl>
  );
};
