import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  IconButton,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { PackagingUnit } from '@/state/packagingUnit/packagingUnit.types';

interface PackagingUnitCardProps {
  packagingUnit: PackagingUnit;
  onDelete: (id: string, name: string) => void;
}

const PackagingUnitCard = ({ packagingUnit, onDelete }: PackagingUnitCardProps) => {
  const navigate = useNavigate();
  const imageUrl = packagingUnit.picture
    ? `${import.meta.env.VITE_API_URL ?? ''}${packagingUnit.picture.path}`
    : null;

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardActionArea
        onClick={() => navigate(`/editPackagingUnit/${packagingUnit.id}`)}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={packagingUnit.name}
            onError={(e) => { const img = e.target as HTMLImageElement; img.onerror = null; img.style.display = 'none'; }}
            sx={{ width: '100%', height: 140, objectFit: 'cover' }}
          />
        ) : (
          <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'action.hover' }}>
            <Inventory2Icon sx={{ fontSize: 56, color: 'text.disabled' }} />
          </Box>
        )}
        <CardContent sx={{ flex: 1, pb: 0 }}>
          <Typography variant="h6" noWrap title={packagingUnit.name} sx={{ fontWeight: 600 }}>
            {packagingUnit.name}
          </Typography>
          {packagingUnit.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {packagingUnit.description}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton size="small" onClick={() => navigate(`/editPackagingUnit/${packagingUnit.id}`)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => onDelete(packagingUnit.id, packagingUnit.name)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default PackagingUnitCard;