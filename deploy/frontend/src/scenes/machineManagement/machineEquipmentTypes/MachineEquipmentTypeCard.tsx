import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CategoryIcon from '@mui/icons-material/Category';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { MachineEquipmentType } from '@/state/machineEquipmentTypes/machineEquipmentTypes.types';

interface MachineEquipmentTypeCardProps {
  type: MachineEquipmentType;
  onDelete: (id: string, name: string) => void;
}

const MachineEquipmentTypeCard = ({ type, onDelete }: MachineEquipmentTypeCardProps) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'action.hover' }}>
        <CategoryIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
      </Box>
      <CardContent sx={{ flex: 1, pb: 0 }}>
        <Typography variant="h6" noWrap title={type.name} sx={{ fontWeight: 600 }}>
          {type.name}
        </Typography>
        {type.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            title={type.description}
          >
            {type.description}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton size="small" onClick={() => navigate(`/editMachineEquipmentType/${type.id}`)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => onDelete(String(type.id), type.name)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default MachineEquipmentTypeCard;