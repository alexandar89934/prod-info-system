import { Box, FormControl, Button } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';

import {
  uploadImage,
  updatePersonsImagePath,
} from '@/state/person/person.actions';
import { AppDispatch } from '@/state/store';

interface ProfileImageUploadProps {
  profilePicture: string;
  personId?: string;
  onImageUpload?: (uploadedPath: string) => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  profilePicture,
  personId,
  onImageUpload,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUploadFormData = new FormData();
      imageUploadFormData.append('profileImage', file);
      const payload = await dispatch(uploadImage(imageUploadFormData)).unwrap();

      if (personId) {
        await dispatch(
          updatePersonsImagePath({
            newImagePath: payload.path,
            personId,
          })
        );
      }
      if (onImageUpload) {
        onImageUpload(payload.path);
      }
    }
  };

  return (
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
          src={profilePicture || ''}
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
  );
};

export default ProfileImageUpload;
