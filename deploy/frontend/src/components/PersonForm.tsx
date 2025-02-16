import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  TextField,
  Typography,
} from '@mui/material';
import React, { ChangeEvent } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

import DocumentList from '@/components/DocumentsList.tsx';
import { personSchema } from '@/zodValidationSchemas/person.schema.ts';

export type PersonFormData = z.infer<typeof personSchema>;

interface PersonFormProps {
  defaultValues: PersonFormData;
  onSubmit: SubmitHandler<PersonFormData>;
  loading: boolean;
  title: string;
  submitButtonText: string;
  onCancel: () => void;
  onImageUpload: (file: File) => Promise<string>;
}

const PersonForm: React.FC<PersonFormProps> = ({
  defaultValues,
  onSubmit,
  loading,
  title,
  submitButtonText,
  onCancel,
  onImageUpload,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues,
  });

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const uploadedImagePath = await onImageUpload(file);
        setValue('picture', uploadedImagePath);
      } catch (err) {
        console.error('Image upload failed:', err);
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ padding: 2 }}>
      <Typography variant="h4" align="center" mb={2}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel htmlFor="employeeNumber">Employee Number</InputLabel>
            <TextField
              id="employeeNumber"
              type="number"
              variant="outlined"
              {...register('employeeNumber', { valueAsNumber: true })}
              error={!!errors.employeeNumber}
              helperText={errors.employeeNumber?.message}
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel htmlFor="name">Name</InputLabel>
            <TextField
              id="name"
              variant="outlined"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel htmlFor="address">Address</InputLabel>
            <TextField
              id="address"
              variant="outlined"
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel htmlFor="mail">Mail</InputLabel>
            <TextField
              id="mail"
              type="email"
              variant="outlined"
              {...register('mail')}
              error={!!errors.mail}
              helperText={errors.mail?.message}
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel htmlFor="additionalInfo">Additional Info</InputLabel>
            <TextField
              id="additionalInfo"
              variant="outlined"
              {...register('additionalInfo')}
              error={!!errors.additionalInfo}
              helperText={errors.additionalInfo?.message}
            />
          </FormControl>
        </Box>
        <Box sx={{ width: 200, textAlign: 'center' }}>
          <img
            src={defaultValues.picture || ''}
            alt="Profile"
            style={{
              width: '150px',
              height: '150px',
              objectFit: 'cover',
              borderRadius: 4,
            }}
          />
          <Button variant="contained" component="label" sx={{ mt: 2 }}>
            Upload Image
            <input type="file" hidden onChange={handleImageChange} />
          </Button>
        </Box>
      </Box>

      <FormControl fullWidth margin="normal">
        <InputLabel htmlFor="documents">Documents</InputLabel>
        <DocumentList />
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {submitButtonText}
        </Button>
        <Button variant="outlined" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default PersonForm;
