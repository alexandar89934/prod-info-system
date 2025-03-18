import { zodResolver } from '@hookform/resolvers/zod';
import {
  Typography,
  CircularProgress,
  Alert,
  Button,
  Box,
  FormControl,
  TextField,
  InputLabel,
  useTheme,
} from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import profile from '../../assets/profile.jpeg';

import DocumentList from '@/components/DocumentsList.tsx';
import ProfileImageUpload from '@/components/ProfileImageUpload.tsx';
import UserRolesSelect from '@/components/UserRolesSelect.tsx';
import { getName } from '@/state/auth/auth.selectors.ts';
import {
  fetchPersonById,
  updatePerson,
} from '@/state/person/person.actions.ts';
import {
  selectError,
  selectLoading,
  selectPerson,
  selectSuccess,
} from '@/state/person/person.selectors.ts';
import {
  clearNotifications,
  clearPerson,
} from '@/state/person/person.slice.ts';
import {
  AddPersonFormData,
  EditPersonFormData,
} from '@/state/person/person.types.ts';
import { AppDispatch } from '@/state/store.ts';
import { personSchema } from '@/zodValidationSchemas/person.schema.ts';

const EditPerson = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  const person: AddPersonFormData = useSelector(selectPerson);
  const imagePath = person.picture ?? profile;
  const error = useSelector(selectError);
  const loading = useSelector(selectLoading);
  const success = useSelector(selectSuccess);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        navigate('/');
        dispatch(clearPerson());
        dispatch(clearNotifications());
      }, 3000);

      return () => clearTimeout(timer); // Cleanup function
    }

    return undefined;
  }, [error, success, dispatch, navigate]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditPersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      id: '',
      employeeNumber: 0,
      name: '',
      address: '',
      mail: '',
      additionalInfo: '',
      picture: '',
      startDate: '',
      endDate: '',
      roles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: getName(),
      updatedBy: getName(),
    },
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchPersonById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (person) {
      reset({
        employeeNumber: person.employeeNumber || 0,
        name: person.name || '',
        address: person.address || '',
        mail: person.mail || '',
        additionalInfo: person.additionalInfo || '',
        picture: person.picture || '',
        startDate: person.startDate
          ? new Date(person.startDate).toISOString().split('T')[0]
          : '',
        endDate: person.endDate
          ? new Date(person.endDate).toISOString().split('T')[0]
          : '',
        roles: person.roles || [],
        createdAt: person.createdAt ? new Date(person.createdAt) : new Date(),
        updatedAt: new Date(),
        createdBy: person.createdBy,
        updatedBy: getName(),
      });
    }
  }, [person, id, reset]);

  const onSubmit = async (data: EditPersonFormData) => {
    await dispatch(updatePerson({ ...data, id })).unwrap();
    setTimeout(() => {
      navigate('/person');
      dispatch(clearPerson());
      dispatch(clearNotifications());
    }, 3000);
  };

  const handleCancel = () => {
    dispatch(clearPerson());
    dispatch(clearNotifications());
    navigate('/person');
  };

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
        <Typography variant="h4" component="h1" align="center" mb={2} mt={2}>
          Edit Person
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
              sx={{ flex: '1 1 65%', display: 'flex', flexDirection: 'column' }}
            >
              <FormControl
                fullWidth
                margin="normal"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ minWidth: '150px', mr: 2 }}>
                  <InputLabel htmlFor="employeeNumber">
                    Employee Number:
                  </InputLabel>
                </Box>
                <TextField
                  id="employeeNumber"
                  type="number"
                  variant="outlined"
                  {...register('employeeNumber', { valueAsNumber: true })}
                  error={!!errors.employeeNumber}
                  helperText={errors.employeeNumber?.message}
                  sx={{ flexGrow: 1 }}
                />
              </FormControl>

              <FormControl
                fullWidth
                margin="normal"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ minWidth: '150px', mr: 2 }}>
                  <InputLabel htmlFor="name">Name:</InputLabel>
                </Box>
                <TextField
                  id="name"
                  variant="outlined"
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{ flexGrow: 1 }}
                />
              </FormControl>

              <FormControl
                fullWidth
                margin="normal"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ minWidth: '150px', mr: 2 }}>
                  <InputLabel htmlFor="address">Address:</InputLabel>
                </Box>
                <TextField
                  id="address"
                  variant="outlined"
                  {...register('address')}
                  error={!!errors.address}
                  helperText={errors.address?.message}
                  sx={{ flexGrow: 1 }}
                />
              </FormControl>
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
                <ProfileImageUpload profilePicture={imagePath} personId={id} />
              </FormControl>
            </Box>
          </Box>

          <FormControl
            fullWidth
            margin="normal"
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <Box sx={{ minWidth: '150px', mr: 2 }}>
              <InputLabel htmlFor="mail">Mail:</InputLabel>
            </Box>
            <TextField
              id="mail"
              type="email"
              variant="outlined"
              {...register('mail')}
              error={!!errors.mail}
              helperText={errors.mail?.message}
              sx={{ flexGrow: 1 }}
            />
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <Box sx={{ minWidth: '150px', mr: 2 }}>
              <InputLabel htmlFor="startDate">Start Date:</InputLabel>
            </Box>
            <TextField
              id="startDate"
              variant="outlined"
              {...register('startDate')}
              error={!!errors.startDate}
              helperText={errors.startDate?.message}
              sx={{ flexGrow: 1 }}
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormControl>
          <FormControl
            fullWidth
            margin="normal"
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <Box sx={{ minWidth: '150px', mr: 2 }}>
              <InputLabel htmlFor="endDate">End Date:</InputLabel>
            </Box>
            <TextField
              id="endDate"
              variant="outlined"
              {...register('endDate')}
              error={!!errors.endDate}
              helperText={errors.endDate?.message}
              sx={{ flexGrow: 1 }}
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <Box sx={{ minWidth: '150px', mr: 2 }}>
              <InputLabel htmlFor="additionalInfo">Additional Info:</InputLabel>
            </Box>
            <TextField
              id="additionalInfo"
              variant="outlined"
              {...register('additionalInfo')}
              error={!!errors.additionalInfo}
              helperText={errors.additionalInfo?.message}
              sx={{ flexGrow: 1 }}
              multiline
              rows={4}
            />
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <Box sx={{ minWidth: '150px', mr: 2 }}>
              <InputLabel htmlFor="roles">Roles:</InputLabel>
            </Box>
            <UserRolesSelect control={control} name="roles" />
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <Box sx={{ minWidth: '150px', mr: 2 }}>
              <InputLabel htmlFor="documents">Documents:</InputLabel>
            </Box>
            <DocumentList personId={id} />
          </FormControl>

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
            {error && (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
                {success}
              </Alert>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ color: theme.palette.primary[200] }}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {loading ? 'Updating...' : 'Update Person'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
                sx={{
                  color: theme.palette.primary[100],
                  borderColor: theme.palette.primary[100],
                  '&:hover': {
                    borderColor: theme.palette.primary[200],
                    backgroundColor: theme.palette.primary[100],
                    color: theme.palette.common.white,
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default EditPerson;
