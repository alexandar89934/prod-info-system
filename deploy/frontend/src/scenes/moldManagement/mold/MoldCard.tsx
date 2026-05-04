import BuildIcon from '@mui/icons-material/Build';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HandymanIcon from '@mui/icons-material/Handyman';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Mold } from '@/state/mold/mold.types';

export type MoldListItem = Mold & { id: string };

type MoldCardProps = {
  mold: MoldListItem;
  onDelete: (mold: MoldListItem) => void;
};

const statusColor = (status: string) => {
  if (status === 'ok') return 'success';
  if (status === 'repair') return 'warning';
  return 'error';
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'ok') return <BuildIcon fontSize="small" />;
  if (status === 'repair') return <HandymanIcon fontSize="small" />;
  return <ErrorOutlineIcon fontSize="small" />;
};

const MoldCard = ({ mold, onDelete }: MoldCardProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 6 },
      }}
      onClick={() => navigate(`/mold/${mold.id}`)}
    >
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              #{mold.inventoryNumber}
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
              {mold.name}
            </Typography>
          </Box>
          <Chip
            label={t(`mold.status.${mold.status}`)}
            color={statusColor(mold.status) as 'success' | 'warning' | 'error'}
            size="small"
            icon={<StatusIcon status={mold.status} />}
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box display="flex" flexDirection="column" gap={0.5}>
          {mold.cavities != null && (
            <Typography variant="body2" color="text.secondary">
              {t('mold.form.cavities')}: <strong>{mold.cavities}</strong>
            </Typography>
          )}
          {mold.weight != null && (
            <Typography variant="body2" color="text.secondary">
              {t('mold.form.weight')}: <strong>{mold.weight} kg</strong>
            </Typography>
          )}
          {mold.serviceCategory && (
            <Typography variant="body2" color="text.secondary">
              {t('mold.form.serviceCategory')}: <strong>{mold.serviceCategory}</strong>
            </Typography>
          )}
          {mold.requiredClampingForceKN != null && (
            <Typography variant="body2" color="text.secondary">
              {t('mold.form.requiredClampingForceKN')}: <strong>{mold.requiredClampingForceKN} kN</strong>
            </Typography>
          )}
        </Box>
      </CardContent>

      <Box
        display="flex"
        justifyContent="flex-end"
        px={1}
        pb={1}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip title={t('mold.actions.edit')}>
          <IconButton size="small" onClick={() => navigate(`/editMold/${mold.id}`)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('mold.actions.delete')}>
          <IconButton size="small" color="error" onClick={() => onDelete(mold)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default MoldCard;