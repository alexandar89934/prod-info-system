import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FolderIcon from '@mui/icons-material/Folder';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { JobPositionCategory } from '@/state/jobPositionCategory/jobPositionCategory.types';

interface JobPositionCategoryCardProps {
  category: JobPositionCategory;
  onDelete: (id: string, name: string) => void;
}

const JobPositionCategoryCard = ({ category, onDelete }: JobPositionCategoryCardProps) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'action.hover' }}>
        <FolderIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
      </Box>
      <CardContent sx={{ flex: 1, pb: 0 }}>
        <Typography variant="h6" noWrap title={category.name} sx={{ fontWeight: 600 }}>
          {category.name}
        </Typography>
        {category.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            title={category.description}
          >
            {category.description}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton size="small" onClick={() => navigate(`/editJobPositionCategory/${category.id}`)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => onDelete(String(category.id), category.name)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default JobPositionCategoryCard;