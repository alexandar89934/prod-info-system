import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
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
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Machine } from '@/state/machine/machine.types';

export type MachineListItem = Machine & { availabilityStatusName?: string | null };

interface MachineCardProps {
  machine: MachineListItem;
  onDelete: (id: string, name: string) => void;
}

const statusColor = (name: string | null | undefined): 'success' | 'warning' | 'error' | 'default' => {
  if (!name) return 'default';
  const lower = name.toLowerCase();
  if (lower.includes('run')) return 'success';
  if (lower.includes('idle')) return 'warning';
  if (lower.includes('fault')) return 'error';
  return 'default';
};

const MachineCard = ({ machine, onDelete }: MachineCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const firstPicture = Array.isArray(machine.pictures) && machine.pictures.length > 0
    ? machine.pictures[0]
    : null;
  const imageUrl = firstPicture ? `/api/file-upload/view-file/${firstPicture.name}` : null;

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardActionArea
        onClick={() => navigate(`/machine/${machine.id}`)}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={machine.name}
            sx={{ width: '100%', height: 180, objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'action.hover',
            }}
          >
            <PrecisionManufacturingIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
          </Box>
        )}

        <CardContent sx={{ flex: 1, pb: 0 }}>
          <Typography variant="h6" noWrap title={machine.name} sx={{ fontWeight: 600 }}>
            {machine.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {t('machine.columns.machineNumber')}: {machine.machineNumber}
          </Typography>
          {machine.serialNumber && (
            <Typography variant="caption" color="text.secondary" display="block" noWrap>
              S/N: {machine.serialNumber}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
            {machine.availabilityStatusName && (
              <Chip
                label={machine.availabilityStatusName}
                color={statusColor(machine.availabilityStatusName)}
                size="small"
              />
            )}
            {machine.workPermit && (
              <Chip label={t('machine.form.workPermit')} color="info" size="small" />
            )}
          </Box>
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton size="small" onClick={() => navigate(`/editMachine/${machine.id}`)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={() => onDelete(String(machine.id), machine.name)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default MachineCard;