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
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import DocumentList from '@/components/DocumentsList.tsx';
import { getName } from '@/state/auth/auth.selectors.ts';
import {
  fetchPersonById,
  updatePerson,
  updatePersonsImagePath,
  uploadImage,
} from '@/state/person/person.actions.ts';
import { selectPerson, selectError } from '@/state/person/person.selectors.ts';
import {
  setDocuments,
  setError,
  clearPerson,
  updatePersonPicture,
} from '@/state/person/person.slice.ts';
import { EditPersonFormData } from '@/state/person/person.types.ts';
import { AppDispatch } from '@/state/store.ts';
import { personSchema } from '@/zodValidationSchemas/person.schema.ts';

const EditPerson = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();

  const person = useSelector(selectPerson);
  const reduxError = useSelector(selectError);
  const [loading, setLoading] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
        createdAt: person.createdAt ? new Date(person.createdAt) : new Date(),
        updatedAt: new Date(),
        createdBy: person.createdBy,
        updatedBy: getName(),
      });
      setImagePath(person.picture);
    }
  }, [person, id, reset]);

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
          await dispatch(
            updatePersonsImagePath({
              newImagePath: uploadedImagePath,
              personId: id,
            })
          );
          setImagePath(uploadedImagePath);
          setValue('picture', uploadedImagePath);
          dispatch(updatePersonPicture(uploadedImagePath));
        }
      } catch (imageUploadError) {
        setError(`Image upload failed: ${imageUploadError}`);
      }
    }
  };

  const onSubmit = async (data: EditPersonFormData) => {
    setLoading(true);
    try {
      const response = await dispatch(updatePerson({ ...data, id })).unwrap();
      if (!response.success) {
        dispatch(setError(response.error.message));
        return;
      }
      dispatch(setError(null));
      setSuccess('Person updated successfully!');
      setTimeout(() => {
        setSuccess(null);
        navigate('/person');
        dispatch(clearPerson());
        dispatch(setDocuments([]));
      }, 3000);
    } catch (err: any) {
      dispatch(setError(err.message || 'An unexpected error occurred.'));
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    dispatch(setError(null));
    dispatch(clearPerson());
    dispatch(setDocuments([]));
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
                <img
                  src={imagePath || ''}
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
            <DocumentList personId={id} />
          </FormControl>

          {reduxError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {reduxError}
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
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ color: theme.palette.primary[200], m: '20px' }}
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : null
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
        </form>
      </Box>
    </Box>
  );
};

export default EditPerson;
