import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import profileImage from '../../assets/profile.jpeg';

import { fetchPersonById } from '@/state/person/person.actions';
import { clearPerson } from '@/state/person/person.slice';
import { selectPerson, selectLoading } from '@/state/person/person.selectors';
import { DocumentData } from '@/state/person/person.types';
import { getEmployeeNumber } from '@/state/auth/auth.selectors';
import { useAppDispatch } from '@/state/hooks';

const PersonPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const person = useSelector(selectPerson);
  const loading = useSelector(selectLoading);
  const currentEmployeeNumber = getEmployeeNumber();

  useEffect(() => {
    dispatch(clearPerson());
    if (id) dispatch(fetchPersonById(id));
  }, [dispatch, id]);

  useEffect(() => () => { dispatch(clearPerson()); }, [dispatch]);

  const handleEdit = () => {
    if (Number(person?.employeeNumber) === Number(currentEmployeeNumber)) {
      navigate('/profilePage');
    } else {
      navigate(`/editPerson/${id}`);
    }
  };

  const ns = t('person.detail.notSpecified');

  const sectionLabel = (text: string) => (
    <Typography
      variant="subtitle2"
      color="text.secondary"
      sx={{ mt: 2, mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}
    >
      {text}
    </Typography>
  );

  const renderFieldRow = (label: string, value?: string | number | null) => (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        py: 0.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        alignItems: 'flex-start',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
        {value !== null && value !== undefined && value !== '' ? value : ns}
      </Typography>
    </Box>
  );

  if (loading || !person?.name) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  const documents = Array.isArray(person.documents)
    ? (person.documents as DocumentData[]).filter((d) => d && typeof d === 'object' && 'name' in d)
    : [];

  const roleNames = Array.isArray(person.roleNames)
    ? person.roleNames.filter(Boolean)
    : [];

  const jobPositionNames = Array.isArray(person.jobPositionNames)
    ? person.jobPositionNames.filter(Boolean)
    : [];

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return null;
    return new Date(date as string).toLocaleDateString('en-GB');
  };

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 3 },
        pt: { xs: 1, sm: 2 },
        pb: 2,
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={1}
      >
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/person')}
          size="small"
        >
          {t('person.detail.back')}
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={600}>
            {person.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            #{person.employeeNumber}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
          disabled={loading}
        >
          {t('person.detail.edit')}
        </Button>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              {sectionLabel(t('person.detail.sectionBasic'))}
              {renderFieldRow(t('person.form.employeeNumber'), person.employeeNumber)}
              {renderFieldRow(t('person.form.name'), person.name)}
              {renderFieldRow(t('person.form.mail'), person.mail)}
              {renderFieldRow(t('person.form.address'), person.address)}

              {sectionLabel(t('person.detail.sectionEmployment'))}
              {renderFieldRow(t('person.form.startDate'), formatDate(person.startDate))}
              {renderFieldRow(t('person.form.endDate'), formatDate(person.endDate))}
              {person.additionalInfo && (
                <>
                  {sectionLabel(t('person.form.additionalInfo'))}
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', py: 0.75 }}>
                    {person.additionalInfo}
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={(person.picture as string) || profileImage}
                sx={{ width: 120, height: 120 }}
              />
              <Box width="100%">
                {sectionLabel(t('person.detail.sectionRoles'))}
                {roleNames.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {roleNames.map((name) => (
                      <Chip key={name} label={name} size="small" variant="outlined" />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">{t('person.detail.noRoles')}</Typography>
                )}

                {sectionLabel(t('person.detail.sectionJobPositions'))}
                {jobPositionNames.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {jobPositionNames.map((name) => (
                      <Chip key={name} label={name} size="small" variant="outlined" />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">{t('person.detail.noJobPositions')}</Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              {sectionLabel(t('person.detail.sectionDocuments'))}
              {documents.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {t('person.detail.noDocuments')}
                </Typography>
              ) : (
                documents.map((doc) => (
                  <Box
                    key={doc.name}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 0.75,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <DescriptionIcon fontSize="small" color="action" sx={{ flexShrink: 0 }} />
                    <Typography
                      variant="body2"
                      sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={doc.name}
                    >
                      {doc.name}
                    </Typography>
                    <a href={`/api/person/view-file/${doc.name}`} target="_blank" rel="noopener noreferrer">
                      <IconButton size="small">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </a>
                    <a href={`/api/person/view-file/${doc.name}`} download={doc.name}>
                      <IconButton size="small">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </a>
                  </Box>
                ))
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PersonPage;