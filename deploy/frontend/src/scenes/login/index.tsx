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
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { userLogin } from '@/state/auth/auth.actions.ts';
import { clearNotifications } from '@/state/auth/auth.slice.ts';
import { useAppDispatch, useAppSelector } from '@/state/hooks.ts';
import { loginSchema } from '@/zodValidationSchemas/login.schema.ts';

export type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const router = useNavigate();

  const { loading, error, success, isLoggedIn } = useAppSelector(
    (state) => state.reducer.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isLoggedIn) {
      router('/');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    return () => {
      dispatch(clearNotifications());
    };
  }, [dispatch]);

  const handleLogin = async (data: LoginFormData) => {
    dispatch(userLogin(data));
  };

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
          Login
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
        <form onSubmit={handleSubmit(handleLogin)}>
          <TextField
            fullWidth
            label="Employee Number"
            variant="outlined"
            margin="normal"
            {...register('employeeNumber')}
            error={!!errors.employeeNumber}
            helperText={errors.employeeNumber?.message}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
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
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
