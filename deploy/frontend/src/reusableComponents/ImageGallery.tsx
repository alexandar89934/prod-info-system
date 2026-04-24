import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from '@mui/material';
import { FC, ChangeEvent, useState, useEffect } from 'react';

export interface GalleryImage {
  name: string;
  path: string;
  dateAdded: string | Date;
}

interface ImageGalleryProps {
  galleryImages: GalleryImage[];
  onImagesSelected: (files: FileList) => Promise<void>;
  onImageRemove: (image: GalleryImage) => Promise<void>;
  isLoading?: boolean;
}

const ImageGallery: FC<ImageGalleryProps> = ({
  galleryImages = [],
  onImagesSelected,
  onImageRemove,
  isLoading = false,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex !== null && lightboxIndex >= galleryImages.length) {
      setLightboxIndex(galleryImages.length > 0 ? galleryImages.length - 1 : null);
    }
  }, [galleryImages.length]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files || files.length === 0) return;
    try {
      await onImagesSelected(files);
    } catch (error) {
      console.error('Image upload error:', error);
    }
    event.target.value = '';
  };

  const handleRemoveClick = async (image: GalleryImage) => {
    try {
      await onImageRemove(image);
    } catch (error) {
      console.error('Image deletion error:', error);
    }
  };

  const currentImage =
    lightboxIndex !== null ? galleryImages[lightboxIndex] ?? null : null;

  const goNext = () => {
    if (lightboxIndex !== null)
      setLightboxIndex((lightboxIndex + 1) % galleryImages.length);
  };

  const goPrev = () => {
    if (lightboxIndex !== null)
      setLightboxIndex(
        (lightboxIndex - 1 + galleryImages.length) % galleryImages.length
      );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        {galleryImages.map((image, index) => (
          <Box
            key={image.path}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => setLightboxIndex(index)}
            sx={{
              width: 80,
              height: 80,
              position: 'relative',
              borderRadius: 1,
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
            }}
          >
            <img
              src={image.path}
              alt={image.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {hoveredIndex === index && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconButton
                  size="small"
                  disabled={isLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveClick(image);
                  }}
                  sx={{
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    '&:hover': { backgroundColor: 'error.main' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        ))}

        <Box
          component="label"
          sx={{
            width: 80,
            height: 80,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            color: 'primary.main',
            flexShrink: 0,
            opacity: isLoading ? 0.5 : 1,
            transition: 'background-color 0.15s',
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          {isLoading ? (
            <CircularProgress size={22} />
          ) : (
            <>
              <AddPhotoAlternateIcon fontSize="small" />
              <Typography
                variant="caption"
                sx={{ mt: 0.5, fontSize: '0.65rem' }}
              >
                Add
              </Typography>
            </>
          )}
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </Box>
      </Box>

      {galleryImages.length === 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: 'block', textAlign: 'center' }}
        >
          No images yet. Click "Add" to upload.
        </Typography>
      )}

      <Dialog
        open={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent
          sx={{
            p: 0,
            backgroundColor: '#111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            position: 'relative',
          }}
        >
          {currentImage && (
            <img
              src={currentImage.path}
              alt={currentImage.name}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          )}

          <IconButton
            onClick={() => setLightboxIndex(null)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.55)',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
            }}
          >
            <CloseIcon />
          </IconButton>

          {currentImage && (
            <IconButton
              disabled={isLoading}
              onClick={() => {
                handleRemoveClick(currentImage);
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 56,
                color: 'white',
                backgroundColor: 'rgba(160,0,0,0.6)',
                '&:hover': { backgroundColor: 'error.main' },
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}

          {galleryImages.length > 1 && (
            <>
              <IconButton
                onClick={goPrev}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
                }}
              >
                <NavigateBeforeIcon />
              </IconButton>
              <IconButton
                onClick={goNext}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
                }}
              >
                <NavigateNextIcon />
              </IconButton>
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  px: 1.5,
                  py: 0.25,
                  borderRadius: 1,
                }}
              >
                {lightboxIndex !== null ? lightboxIndex + 1 : 0} /{' '}
                {galleryImages.length}
              </Typography>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ImageGallery;