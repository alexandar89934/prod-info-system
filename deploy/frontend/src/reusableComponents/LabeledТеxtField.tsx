import { TextField, InputLabel, FormControl, useTheme } from '@mui/material';
import { useRef } from 'react';
import { FieldError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'number' | 'text' | 'email' | 'password' | 'string' | 'date' | 'datetime-local';
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: FieldError;
  multiline?: boolean;
  rows?: number;
  minWidth?: string;
  fullWidth?: boolean;
  InputLabelProps?: { shrink?: boolean };
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
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
  minWidth = '220px',
  fullWidth = true,
  InputLabelProps,
  inputProps,
}: FormFieldProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (type === 'date' || type === 'datetime-local') inputRef.current?.showPicker();
  };

  return (
    <FormControl
      fullWidth={fullWidth}
      margin="normal"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'flex-start',
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
          whiteSpace: 'normal',
          overflow: 'visible',
          lineHeight: 1.4,
          paddingTop: { sm: '14px' },
        }}
      >
        {label}:
      </InputLabel>
      <TextField
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onClick={handleClick}
        variant="outlined"
        inputRef={inputRef}
        error={!!error}
        helperText={error?.message ? t(error.message) : undefined}
        multiline={multiline}
        rows={rows}
        fullWidth={fullWidth}
        InputLabelProps={(type === 'date' || type === 'datetime-local') ? { shrink: true, ...InputLabelProps } : InputLabelProps}
        inputProps={inputProps}
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
