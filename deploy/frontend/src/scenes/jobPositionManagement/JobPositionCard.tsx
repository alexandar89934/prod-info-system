import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WorkIcon from '@mui/icons-material/Work';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { JobPosition } from '@/state/jobPosition/jobPosition.types';

export type JobPositionListItem = JobPosition & { categoryName?: string | null };

interface JobPositionCardProps {
  jobPosition: JobPositionListItem;
  onDelete: (id: string, name: string) => void;
}

const JobPositionCard = ({ jobPosition, onDelete }: JobPositionCardProps) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'action.hover' }}>
        <WorkIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
      </Box>
      <CardContent sx={{ flex: 1, pb: 0 }}>
        <Typography variant="h6" noWrap title={jobPosition.name} sx={{ fontWeight: 600 }}>
          {jobPosition.name}
        </Typography>
        {jobPosition.categoryName && (
          <Box sx={{ mt: 0.5 }}>
            <Chip label={jobPosition.categoryName} size="small" />
          </Box>
        )}
        {jobPosition.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            title={jobPosition.description}
          >
            {jobPosition.description}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton size="small" onClick={() => navigate(`/editJobPosition/${jobPosition.id}`)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => onDelete(String(jobPosition.id), jobPosition.name)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default JobPositionCard;