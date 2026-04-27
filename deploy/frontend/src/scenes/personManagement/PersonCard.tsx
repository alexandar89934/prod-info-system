import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import profileImage from '../../assets/profile.jpeg';

import { getEmployeeNumber } from '@/state/auth/auth.selectors';
import { PersonFormDataBase } from '@/state/person/person.types';

interface PersonCardProps {
  person: PersonFormDataBase & { id: string };
  onDelete: (id: string, name: string) => void;
}

const PersonCard = ({ person, onDelete }: PersonCardProps) => {
  const navigate = useNavigate();
  const currentEmployeeNumber = getEmployeeNumber();

  const handleEdit = () => {
    if (Number(person.employeeNumber) === Number(currentEmployeeNumber)) {
      navigate('/profilePage');
    } else {
      navigate(`/editPerson/${person.id}`);
    }
  };

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
      </CardContent>
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