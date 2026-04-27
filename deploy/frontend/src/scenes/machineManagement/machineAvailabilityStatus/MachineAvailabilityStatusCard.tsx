import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { MachineAvailabilityStatus } from '@/state/machineAvailabilityStatus/machineAvailabilityStatus.types';

interface MachineAvailabilityStatusCardProps {
  status: MachineAvailabilityStatus;
  onDelete: (id: string, name: string) => void;
}

const statusColor = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('run')) return '#4caf50';
  if (lower.includes('idle')) return '#ff9800';
  if (lower.includes('fault')) return '#f44336';
  return '#9e9e9e';
};

const MachineAvailabilityStatusCard = ({ status, onDelete }: MachineAvailabilityStatusCardProps) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'action.hover' }}>
        <FiberManualRecordIcon sx={{ fontSize: 48, color: statusColor(status.name) }} />
      </Box>
      <CardContent sx={{ flex: 1, pb: 0 }}>
        <Typography variant="h6" noWrap title={status.name} sx={{ fontWeight: 600 }}>
          {status.name}
        </Typography>
        {status.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            title={status.description}
          >
            {status.description}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton size="small" onClick={() => navigate(`/editMachineAvailabilityStatus/${status.id}`)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => onDelete(String(status.id), status.name)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default MachineAvailabilityStatusCard;