import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { MachineEquipment } from '@/state/machineEquipment/machineEquipment.types';

export type MachineEquipmentListItem = MachineEquipment & {
  equipmentTypeName?: string | null;
  machineName?: string | null;
  machineNumber?: number | null;
};

interface MachineEquipmentCardProps {
  equipment: MachineEquipmentListItem;
  onDelete: (id: string, name: string) => void;
}

const MachineEquipmentCard = ({ equipment, onDelete }: MachineEquipmentCardProps) => {
  const navigate = useNavigate();

  const firstPicture = Array.isArray(equipment.pictures) && equipment.pictures.length > 0
    ? equipment.pictures[0]
    : null;
  const imageUrl = firstPicture ? `/api/file-upload/view-file/${(firstPicture as { name: string }).name}` : null;

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardActionArea
        onClick={() => navigate(`/machineEquipment/${equipment.id}`)}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={equipment.name}
            sx={{ width: '100%', height: 140, objectFit: 'cover' }}
          />
        ) : (
          <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'action.hover' }}>
            <SettingsIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
          </Box>
        )}
        <CardContent sx={{ flex: 1, pb: 0 }}>
          <Typography variant="h6" noWrap title={equipment.name} sx={{ fontWeight: 600 }}>
            {equipment.name}
          </Typography>
          {equipment.model && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {equipment.model}
            </Typography>
          )}
          {equipment.serialNumber && (
            <Typography variant="caption" color="text.secondary" display="block" noWrap>
              S/N: {equipment.serialNumber}
            </Typography>
          )}
          {equipment.equipmentTypeName && (
            <Box sx={{ mt: 1 }}>
              <Chip label={equipment.equipmentTypeName} size="small" />
            </Box>
          )}
          {equipment.machineName && (
            <Box sx={{ mt: 0.5 }}>
              <Chip
                icon={<PrecisionManufacturingIcon />}
                label={`#${equipment.machineNumber} – ${equipment.machineName}`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            </Box>
          )}
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton size="small" onClick={() => navigate(`/editMachineEquipment/${equipment.id}`)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => onDelete(String(equipment.id), equipment.name)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default MachineEquipmentCard;