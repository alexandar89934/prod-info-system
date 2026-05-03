import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import profileImage from '../../assets/profile.jpeg';

import { getEmployeeNumber } from '@/state/auth/auth.selectors';
import { PersonFormDataBase, PersonStatus } from '@/state/person/person.types';

const STATUS_COLORS: Record<PersonStatus, 'success' | 'default' | 'primary' | 'warning' | 'info'> = {
  working: 'success',
  off: 'default',
  vacation: 'primary',
  sick: 'warning',
  break: 'info',
};

interface PersonCardProps {
  person: PersonFormDataBase & { id: string };
  onDelete: (id: string, name: string) => void;
}

const PersonCard = ({ person, onDelete }: PersonCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentEmployeeNumber = getEmployeeNumber();

  const handleEdit = () => {
    if (Number(person.employeeNumber) === Number(currentEmployeeNumber)) {
      navigate('/profilePage');
    } else {
      navigate(`/editPerson/${person.id}`);
    }
  };

  const handleView = () => navigate(`/person/${person.id}`);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        onClick={handleView}
        sx={{ cursor: 'pointer' }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
          <Avatar
            src={(person.picture as string) || profileImage}
            sx={{ width: 72, height: 72 }}
          />
        </Box>
        <CardContent sx={{ flex: 1, pb: 0, textAlign: 'center' }}>
          <Typography variant="h6" noWrap title={person.name} sx={{ fontWeight: 600 }}>
            {person.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            #{person.employeeNumber}
          </Typography>
          {person.mail && (
            <Typography variant="caption" color="text.secondary" display="block" noWrap title={person.mail}>
              {person.mail}
            </Typography>
          )}
          {person.startDate && (
            <Typography variant="caption" color="text.secondary" display="block">
              {new Date(person.startDate as string).toLocaleDateString('en-GB')}
            </Typography>
          )}
          {person.currentPositionName && (
            <Typography variant="caption" color="text.secondary" display="block" noWrap title={person.currentPositionName} sx={{ mt: 0.5 }}>
              {person.currentPositionName}
            </Typography>
          )}
          {person.status && (
            <Box sx={{ mt: 0.5, display: 'flex', justifyContent: 'center' }}>
              <Chip
                label={t(`person.status.${person.status}`)}
                color={STATUS_COLORS[person.status as PersonStatus] ?? 'default'}
                size="small"
              />
            </Box>
          )}
        </CardContent>
      </Box>
      <CardActions sx={{ justifyContent: 'center', pt: 0 }}>
        <IconButton size="small" onClick={handleEdit}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => onDelete(String(person.id), person.name)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default PersonCard;