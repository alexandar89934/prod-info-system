import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
      gap={2}
    >
      <LockOutlinedIcon
        sx={{ fontSize: 64, color: theme.palette.secondary[300] }}
      />
      <Typography variant="h4" fontWeight="bold">
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center">
        You must be logged in to access this page.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/login')}>
        Go to Login
      </Button>
    </Box>
  );
};

export default Unauthorized;