import {
  FormControl,
  MenuItem,
  Select,
  useTheme,
  Box,
  Typography,
} from '@mui/material';
import { FieldError } from 'react-hook-form';

interface Option {
  value: number | string;
  label: string;
}

interface LabeledXtSelectProps {
  id: string;
  label: string;
  options: Option[];
  value: string | number;
  onChange: (value: any) => void;
  error?: FieldError;
  minWidth?: string;
  fullWidth?: boolean;
  disabledDefaultText?: string;
}

export const LabeledXtSelect = ({
  id,
  label,
  options,
  value,
  onChange,
  error,
  minWidth = '150px',
  fullWidth = true,
  disabledDefaultText = 'Select an option',
}: LabeledXtSelectProps) => {
  const theme = useTheme();

  return (
    <FormControl
      fullWidth={fullWidth}
      margin="normal"
      error={!!error}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 1, sm: 2 },
      }}
    >
      <Typography
        component="label"
        htmlFor={id}
        sx={{
          minWidth,
          marginBottom: { xs: 1, sm: 0 },
          color: theme.palette.text.primary,
          userSelect: 'text',
        }}
      >
        {label}:
      </Typography>

      <Box sx={{ width: '100%' }}>
        <Select id={id} fullWidth={fullWidth} value={value} onChange={onChange}>
          <MenuItem value="" disabled>
            {disabledDefaultText}
          </MenuItem>
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        {error && (
          <Box
            sx={{
              color: theme.palette.error.main,
              fontSize: '0.75rem',
              mt: 0.5,
            }}
          >
            {error.message}
          </Box>
        )}
      </Box>
    </FormControl>
  );
};
