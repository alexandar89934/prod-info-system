import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Alert,
  useTheme,
  FormControl,
  InputLabel,
} from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import profileImage from '../../assets/profile.jpeg';

import DocumentList from '@/components/DocumentsList.tsx';
import { getName } from '@/state/auth/auth.selectors.ts';
import { useAppDispatch } from '@/state/hooks.ts';
import { addPerson, uploadImage } from '@/state/person/person.actions.ts';
import { addPersonSchema } from '@/state/person/person.schema.ts';
import { selectPerson } from '@/state/person/person.selectors.ts';
import { setDocuments } from '@/state/person/person.slice.ts';
import { AddPersonFormData } from '@/state/person/person.types.ts';

const AddPerson: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(profileImage);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const person = useSelector(selectPerson);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddPersonFormData>({
    resolver: zodResolver(addPersonSchema),
    defaultValues: {
      employeeNumber: 0,
      name: '',
      address: '',
      mail: '',
      additionalInfo: '',
      picture: profileImage,
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: getName(),
      updatedBy: getName(),
      profileImage,
    },
  });

  const handleAddPerson = async (data: AddPersonFormData) => {
    setLoading(true);
    try {
      const payload = { ...data, documents: person?.documents ?? [] };
      const response = await dispatch(addPerson(payload)).unwrap();
      if (!response.success) {
        setError(response.error.message);
        return;
      }
      setError(null);
      setSuccess('Person added successfully!');
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      setImagePath(profileImage);
      dispatch(setDocuments([]));
      reset();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    dispatch(setDocuments([]));
    navigate('/person');
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUploadFormData = new FormData();
      imageUploadFormData.append('profileImage', file);
      try {
        const response = await dispatch(uploadImage(imageUploadFormData));
        if (response.meta.requestStatus === 'fulfilled') {
          const uploadedImagePath = response.payload?.path;
          setImagePath(uploadedImagePath);
          setValue('picture', uploadedImagePath);
        }
      } catch (imageUploadError) {
        console.error('Image upload failed:', imageUploadError);
      }
    }
  };

  const onSubmit = (data: AddPersonFormData) => {
    handleAddPerson(data);
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
          Add New Person
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
                <img
                  src={imagePath || profileImage}
                  alt="Profile"
                  style={{
                    maxWidth: '150px',
                    maxHeight: '150px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
                <Button variant="contained" component="label" sx={{ mt: 2 }}>
                  Upload Image
                  <input type="file" hidden onChange={handleImageChange} />
                </Button>
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
              <InputLabel htmlFor="additionalInfo">Additional Info:</InputLabel>
            </Box>
            <TextField
              id="additionalInfo"
              variant="outlined"
              {...register('additionalInfo')}
              error={!!errors.additionalInfo}
              helperText={errors.additionalInfo?.message}
              sx={{ flexGrow: 1 }}
            />
          </FormControl>
          <FormControl
            fullWidth
            margin="normal"
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <Box sx={{ minWidth: '150px', mr: 2 }}>
              <InputLabel htmlFor="documents">Documents:</InputLabel>
            </Box>
            <DocumentList />
          </FormControl>

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

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'start',
              alignItems: 'center',
              padding: 2,
              backgroundColor: theme.palette.background.default,
              position: 'sticky',
              bottom: 0,
              left: 0,
              width: '100%',
            }}
          >
            <Button
              variant="contained"
              sx={{ color: theme.palette.primary[200], m: '20px' }}
              type="submit"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {loading ? 'Adding...' : 'Add Person'}
            </Button>
            <Button
              variant="outlined"
              sx={{
                color: theme.palette.primary[100],
                borderColor: theme.palette.primary[100],
                '&:hover': {
                  borderColor: theme.palette.primary[200],
                  backgroundColor: theme.palette.primary[100],
                  color: theme.palette.common.white,
                },
              }}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default AddPerson;
