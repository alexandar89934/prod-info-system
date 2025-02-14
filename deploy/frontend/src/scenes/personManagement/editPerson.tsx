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
import { setDocuments, setError } from '@/state/person/person.slice.ts';
import { EditPersonFormData } from '@/state/person/person.types.ts';
import { AppDispatch } from '@/state/store.ts';

const EditPerson = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const person = useSelector(selectPerson);
  const error = useSelector(selectError);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<EditPersonFormData>({
    id: '',
    employeeNumber: 0,
    name: '',
    address: '',
    mail: '',
    picture: '',
    additionalInfo: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: getName(),
    updatedBy: getName(),
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchPersonById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (person) {
      setFormData({
        id,
        employeeNumber: person.employeeNumber || 0,
        name: person.name || '',
        address: person.address || '',
        mail: person.mail || '',
        additionalInfo: person.additionalInfo || '',
        picture: person.picture || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: person.createdBy,
        updatedBy: getName(),
      });
      setImagePath(person.picture);
    }
  }, [id, person]);

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value });
    };

  const handleCancel = () => {
    dispatch(setDocuments([]));
    navigate('/person');
  };

  const handleUpdatePerson = async (data: EditPersonFormData) => {
    setLoading(true);
    try {
      const response = await dispatch(updatePerson(data)).unwrap();
      if (!response.success) {
        setError(response.error.message);
        return;
      }
      setError(null);
      setSuccess('Person updated successfully!');
      setTimeout(() => {
        setSuccess(null);
        navigate('/person');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleUpdatePerson(formData);
  };
  const formErrors = {
    employeeNumber: '',
    name: '',
    address: '',
    mail: '',
    picture: '',
    additionalInfo: '',
    documents: '',
    createdBy: '',
    updatedBy: '',
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
          await dispatch(
            updatePersonsImagePath({
              newImagePath: uploadedImagePath,
              personId: id,
            })
          );

          setImagePath(uploadedImagePath);
          setFormData((prev) => ({
            ...prev,
            picture: uploadedImagePath,
          }));
        }
      } catch (imageUploadError) {
        console.error('Image upload failed:', imageUploadError);
      }
    }
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
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main, // Adjust to fit theme
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
        <form onSubmit={handleSubmit}>
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
                  value={formData.employeeNumber}
                  onChange={handleChange('employeeNumber')}
                  error={!!formErrors.employeeNumber}
                  helperText={formErrors.employeeNumber}
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
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
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
                  value={formData.address}
                  onChange={handleChange('address')}
                  error={!!formErrors.address}
                  helperText={formErrors.address}
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
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexGrow: 1,
                  }}
                >
                  <img
                    src={imagePath}
                    alt="Default Profile"
                    style={{
                      maxWidth: '150px',
                      maxHeight: '150px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />

                  <Button variant="contained" component="label" sx={{ mt: 2 }}>
                    Upload Image
                    <input
                      type="file"
                      hidden
                      onChange={(e) => handleImageChange(e)}
                    />
                  </Button>
                </Box>
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
              value={formData.mail}
              onChange={handleChange('mail')}
              error={!!formErrors.mail}
              helperText={formErrors.mail}
              sx={{ flexGrow: 1 }}
            />
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <Box sx={{ minWidth: '150px', mr: 2 }}>
              <InputLabel htmlFor="additional_info">
                Additional Info:
              </InputLabel>
            </Box>
            <TextField
              id="additional_info"
              variant="outlined"
              value={formData.additionalInfo}
              onChange={handleChange('additionalInfo')}
              error={!!formErrors.additionalInfo}
              helperText={formErrors.additionalInfo}
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
              type="submit"
              sx={{ color: theme.palette.primary[200], m: '20px' }}
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {loading ? 'Updating...' : 'Update Person'}
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

export default EditPerson;
