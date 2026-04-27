import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchMachineEquipmentById } from '@/state/machineEquipment/machineEquipment.actions';
import {
  selectCurrentMachineEquipment,
  selectMachineEquipmentLoading,
} from '@/state/machineEquipment/machineEquipment.selectors';
import { resetState } from '@/state/machineEquipment/machineEquipment.slice';
import { useAppDispatch } from '@/state/hooks';

const MachineEquipmentPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const equipment = useSelector(selectCurrentMachineEquipment);
  const loading = useSelector(selectMachineEquipmentLoading);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (id) dispatch(fetchMachineEquipmentById(id));
  }, [dispatch, id]);

  useEffect(() => () => { dispatch(resetState()); }, [dispatch]);

  const ns = t('machineEquipment.detail.notSpecified');
  const pictures = Array.isArray(equipment?.pictures) ? equipment.pictures : [];
  const documents = Array.isArray(equipment?.documents) ? equipment.documents : [];

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
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 200, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
        {value !== null && value !== undefined && value !== '' ? value : ns}
      </Typography>
    </Box>
  );

  if (!equipment) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

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
          onClick={() => navigate('/machineEquipment')}
          size="small"
        >
          {t('machineEquipment.detail.back')}
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={600}>
            {equipment.name}
          </Typography>
          {equipment.serialNumber && (
            <Typography variant="body2" color="text.secondary">
              S/N: {equipment.serialNumber}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/editMachineEquipment/${id}`)}
          disabled={loading}
        >
          {t('machineEquipment.detail.edit')}
        </Button>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              {sectionLabel(t('machineEquipment.detail.sectionBasic'))}
              {renderFieldRow(t('machineEquipment.detail.name'), equipment.name)}
              {renderFieldRow(t('machineEquipment.detail.model'), equipment.model)}
              {renderFieldRow(t('machineEquipment.detail.serialNumber'), equipment.serialNumber)}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  py: 0.75,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 200, flexShrink: 0 }}>
                  {t('machineEquipment.detail.equipmentType')}
                </Typography>
                {equipment.equipmentTypeName
                  ? <Chip label={equipment.equipmentTypeName} size="small" />
                  : <Typography variant="body2">{ns}</Typography>}
              </Box>
              {renderFieldRow(t('machineEquipment.detail.description'), equipment.description)}

              {sectionLabel(t('machineEquipment.detail.sectionMachineAssignment'))}
              <Box sx={{ display: 'flex', gap: 1, py: 0.75, alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 200, flexShrink: 0 }}>
                  {t('machineEquipment.detail.assignedMachine')}
                </Typography>
                {equipment.machineId && equipment.machineName ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={<PrecisionManufacturingIcon />}
                      label={`#${equipment.machineNumber} – ${equipment.machineName}`}
                      color="secondary"
                      size="small"
                    />
                    <Button
                      size="small"
                      variant="text"
                      color="secondary"
                      onClick={() => navigate(`/machine/${equipment.machineId}`)}
                    >
                      {t('machineEquipment.detail.goToMachine')}
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t('machineEquipment.detail.noMachineAssigned')}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {pictures.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}
                >
                  {t('machineEquipment.detail.sectionMedia')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {pictures.map((pic, idx) => (
                    <Box
                      key={(pic as { name: string }).name}
                      component="img"
                      src={`/api/file-upload/view-file/${(pic as { name: string }).name}`}
                      alt={(pic as { name: string }).name}
                      onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                      sx={{
                        width: 120,
                        height: 90,
                        objectFit: 'cover',
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: '2px solid transparent',
                        '&:hover': { opacity: 0.85, borderColor: theme.palette.primary.main },
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}

          {documents.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}
                >
                  {t('machineEquipment.detail.sectionDocuments')}
                </Typography>
                {documents.map((doc) => (
                  <Box
                    key={(doc as { name: string }).name}
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
                      title={(doc as { name: string }).name}
                    >
                      {(doc as { name: string }).name}
                    </Typography>
                    <a href={`/api/file-upload/view-file/${(doc as { name: string }).name}`} target="_blank" rel="noopener noreferrer">
                      <IconButton size="small">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </a>
                    <a href={`/api/file-upload/view-file/${(doc as { name: string }).name}`} download={(doc as { name: string }).name}>
                      <IconButton size="small">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </a>
                  </Box>
                ))}
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>

      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { backgroundColor: '#111', height: '90vh' } }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {pictures.length > 0 && (
            <Box
              component="img"
              src={`/api/file-upload/view-file/${(pictures[lightboxIndex] as { name: string })?.name}`}
              alt={(pictures[lightboxIndex] as { name: string })?.name}
              sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          )}
          <IconButton
            onClick={() => setLightboxOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8, color: 'white', backgroundColor: 'rgba(0,0,0,0.4)' }}
          >
            <CloseIcon />
          </IconButton>
          {pictures.length > 1 && (
            <>
              <IconButton
                onClick={() => setLightboxIndex((prev) => (prev - 1 + pictures.length) % pictures.length)}
                sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'white', backgroundColor: 'rgba(0,0,0,0.4)' }}
              >
                <NavigateBeforeIcon />
              </IconButton>
              <IconButton
                onClick={() => setLightboxIndex((prev) => (prev + 1) % pictures.length)}
                sx={{ position: 'absolute', right: 56, top: '50%', transform: 'translateY(-50%)', color: 'white', backgroundColor: 'rgba(0,0,0,0.4)' }}
              >
                <NavigateNextIcon />
              </IconButton>
            </>
          )}
          <Typography
            variant="caption"
            sx={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)' }}
          >
            {lightboxIndex + 1} / {pictures.length}
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MachineEquipmentPage;