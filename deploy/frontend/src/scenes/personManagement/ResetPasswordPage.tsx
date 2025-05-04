import { zodResolver } from '@hookform/resolvers/zod';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import Alert from '@mui/material/Alert';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { z } from 'zod';

import { getFromLocalStorage } from '@/services/local.storage.ts';
import { resetPassword } from '@/state/auth/auth.actions.ts';
import { clearNotifications } from '@/state/auth/auth.slice.ts';
import { useAppDispatch } from '@/state/hooks.ts';
import { RootState } from '@/state/store.ts';
import { resetPasswordSchema } from '@/zodValidationSchemas/login.schema.ts';

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const { loading, error, success } = useSelector(
    (state: RootState) => state.reducer.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleReset = async (data: ResetPasswordFormData) => {
    const employeeNumber = getFromLocalStorage('employeeNumber');

    const payload = {
      ...data,
      employeeNumber,
    };

    await dispatch(resetPassword(payload));
  };

  useEffect(() => {
    return () => {
      dispatch(clearNotifications());
    };
  }, [dispatch]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      sx={{ padding: 2 }}
    >
      <Box
        width="100%"
        maxWidth="400px"
        p={3}
        border="1px solid"
        borderColor="grey.300"
        borderRadius={2}
        boxShadow={1}
      >
        <Typography variant="h4" component="h1" align="center" mb={2}>
          Reset Password
        </Typography>

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

        <form onSubmit={handleSubmit(handleReset)}>
          <TextField
            fullWidth
            label="Old Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            {...register('oldPassword')}
            error={!!errors.oldPassword}
            helperText={errors.oldPassword?.message}
          />

          <TextField
            fullWidth
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            {...register('newPassword')}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />

          <TextField
            fullWidth
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            sx={{ marginTop: 2 }}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {loading ? 'Updating...' : 'Reset Password'}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default ResetPassword;
