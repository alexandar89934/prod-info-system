import { Box, FormControl, Button } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import profile from '../../../assets/profile.jpeg';

import {
  uploadImage,
  updatePersonsImagePath,
  deleteFileNewPerson,
} from '@/state/person/person.actions.ts';
import { AppDispatch } from '@/state/store.ts';

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
  const [currentImagePath, setCurrentImagePath] = useState<string>(profile);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      dispatch(deleteFileNewPerson({ documentPath: currentImagePath }));
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
        setCurrentImagePath(payload.path);
        onImageUpload(payload.path);
      }
    }
  };

  const handleRemoveImageClick = async () => {
    const defaultImagePath = profile;
    if (personId) {
      await dispatch(
        updatePersonsImagePath({
          newImagePath: defaultImagePath,
          personId,
        })
      );
    }
    if (onImageUpload) {
      await dispatch(deleteFileNewPerson({ documentPath: currentImagePath }));
      onImageUpload(defaultImagePath);
    }
    setCurrentImagePath(defaultImagePath);
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
        <label
          htmlFor="image-upload"
          style={{ cursor: 'pointer', display: 'block' }}
        >
          <img
            src={profilePicture || ''}
            alt="Profile"
            style={{
              maxWidth: '140px',
              maxHeight: '140px',
              objectFit: 'cover',
              borderRadius: '4px',
            }}
          />
          <input
            id="image-upload"
            type="file"
            hidden
            onChange={handleImageChange}
          />
        </label>
        <Button variant="contained" component="label" sx={{ mt: 1 }}>
          Upload Image
          <input type="file" hidden onChange={handleImageChange} />
        </Button>
        <Button
          variant="text"
          color="warning"
          onClick={handleRemoveImageClick}
          sx={{ mt: 1 }}
        >
          Remove Image
        </Button>
      </FormControl>
    </Box>
  );
};

export default ProfileImageUpload;
