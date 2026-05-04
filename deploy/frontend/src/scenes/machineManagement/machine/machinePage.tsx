import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import {
  assignEquipmentToMachine,
  fetchMachineById,
  unassignEquipmentFromMachine,
} from '@/state/machine/machine.actions';
import {
  selectCurrentMachine,
  selectMachineLoading,
} from '@/state/machine/machine.selectors';
import { AttachedEquipment } from '@/state/machine/machine.types';
import { resetState } from '@/state/machine/machine.slice';
import { useAppDispatch } from '@/state/hooks';
import axiosServer from '@/services/axios.service';

const statusColor = (name: string | null | undefined): 'success' | 'warning' | 'error' | 'default' => {
  if (!name) return 'default';
  const lower = name.toLowerCase();
  if (lower.includes('run')) return 'success';
  if (lower.includes('idle')) return 'warning';
  if (lower.includes('fault')) return 'error';
  return 'default';
};

const MachinePage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const machine = useSelector(selectCurrentMachine);
  const loading = useSelector(selectMachineLoading);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [mountedMold, setMountedMold] = useState<{ id: string; inventoryNumber: number; name: string } | null>(null);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [unassignedEquipment, setUnassignedEquipment] = useState<AttachedEquipment[]>([]);
  const [dialogLoading, setDialogLoading] = useState(false);

  const fetchUnassigned = async (search = '') => {
    setDialogLoading(true);
    try {
      const res = await axiosServer.get('/machine-equipment/unassigned', { params: { search } });
      if (res.data.success) {
        setUnassignedEquipment(res.data.content.equipments);
      }
    } finally {
      setDialogLoading(false);
    }
  };

  const openAssignDialog = () => {
    setEquipmentSearch('');
    setAssignDialogOpen(true);
    fetchUnassigned('');
  };

  const handleSearchChange = (value: string) => {
    setEquipmentSearch(value);
    fetchUnassigned(value);
  };

  const handleAssign = async (equipmentId: number) => {
    if (!id) return;
    const result = await dispatch(assignEquipmentToMachine({ equipmentId, machineId: id }));
    if (assignEquipmentToMachine.fulfilled.match(result)) {
      setAssignDialogOpen(false);
      dispatch(fetchMachineById(id));
    }
  };

  const handleUnassign = async (equipmentId: number) => {
    if (!id) return;
    const result = await dispatch(unassignEquipmentFromMachine(equipmentId));
    if (unassignEquipmentFromMachine.fulfilled.match(result)) {
      dispatch(fetchMachineById(id));
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchMachineById(id));
      axiosServer.get(`/mold/mounted-on/${id}`).then((res) => {
        if (res.data.success) setMountedMold(res.data.content.mold ?? null);
      }).catch(() => { setMountedMold(null); });
    }
  }, [dispatch, id]);

  useEffect(() => () => { dispatch(resetState()); }, [dispatch]);

  const pictures = Array.isArray(machine?.pictures) ? machine.pictures : [];
  const documents = Array.isArray(machine?.documents) ? machine.documents : [];
  const ns = t('machine.detail.notSpecified');

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
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 220, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
        {value !== null && value !== undefined && value !== '' ? value : ns}
      </Typography>
    </Box>
  );

  const renderBoolField = (label: string, value: boolean | null | undefined) => (
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
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 220, flexShrink: 0 }}>
        {label}
      </Typography>
      {value
        ? <CheckIcon color="success" fontSize="small" />
        : <CloseIcon color="disabled" fontSize="small" />}
    </Box>
  );

  if (!machine) {
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
        <Button variant="outlined" color="secondary" startIcon={<ArrowBackIcon />} onClick={() => navigate('/machine')} size="small">
          {t('machine.detail.back')}
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={600}>
            {machine.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            #{machine.machineNumber}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/editMachine/${id}`)}
          disabled={loading}
        >
          {t('machine.detail.edit')}
        </Button>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              {sectionLabel(t('machine.form.sectionBasic'))}
              {renderFieldRow(t('machine.form.name'), machine.name)}
              {renderFieldRow(t('machine.form.machineNumber'), machine.machineNumber)}
              {renderFieldRow(t('machine.form.serialNumber'), machine.serialNumber)}
              {renderFieldRow(t('machine.form.yearOfManufacture'), machine.yearOfManufacture)}
              {renderFieldRow(t('machine.form.controlSystem'), machine.controlSystem)}
              {renderFieldRow(t('machine.form.description'), machine.description)}

              {sectionLabel(t('machine.form.sectionStatus'))}
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
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 220, flexShrink: 0 }}>
                  {t('machine.form.availabilityStatus')}
                </Typography>
                {machine.availabilityStatusName
                  ? (
                    <Chip
                      label={machine.availabilityStatusName}
                      color={statusColor(machine.availabilityStatusName)}
                      size="small"
                    />
                  )
                  : <Typography variant="body2">{ns}</Typography>}
              </Box>
              {renderBoolField(t('machine.form.workPermit'), machine.workPermit)}

              {sectionLabel(t('machine.form.sectionModes'))}
              {renderBoolField(t('machine.form.automaticMode'), machine.automaticMode)}
              {renderBoolField(t('machine.form.semiAutomaticMode'), machine.semiAutomaticMode)}
              {renderBoolField(t('machine.form.manualMode'), machine.manualMode)}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              {sectionLabel(t('machine.form.sectionTechnical'))}
              {renderFieldRow(t('machine.form.clampingForce'), machine.clampingForce)}
              {renderFieldRow(t('machine.form.injectionWeight'), machine.injectionWeight)}

              {sectionLabel(t('machine.form.sectionMoldLimits'))}
              {renderFieldRow(t('machine.form.maxMoldWidth'), machine.maxMoldWidth)}
              {renderFieldRow(t('machine.form.maxMoldHeight'), machine.maxMoldHeight)}
              {renderFieldRow(t('machine.form.minMoldThickness'), machine.minMoldThickness)}
              {renderFieldRow(t('machine.form.maxMoldThickness'), machine.maxMoldThickness)}
              {renderFieldRow(t('machine.form.centeringRingFixedSide'), machine.centeringRingFixedSide)}
              {renderFieldRow(t('machine.form.centeringRingMovingSide'), machine.centeringRingMovingSide)}
              {renderFieldRow(t('machine.form.maxMoldWeight'), machine.maxMoldWeight)}

              {sectionLabel(t('machine.form.sectionService'))}
              {renderFieldRow(t('machine.form.serviceInterval'), machine.serviceInterval)}
              {renderFieldRow(t('machine.form.lastServiceDone'), machine.lastServiceDone)}

              {sectionLabel(t('machine.form.sectionCounters'))}
              {renderFieldRow(t('machine.form.workHoursCounter'), machine.workHoursCounter ?? 0)}
              {renderFieldRow(t('machine.form.pieceCounter'), machine.pieceCounter ?? 0)}
              {renderFieldRow(t('machine.form.scrapCounter'), machine.scrapCounter ?? 0)}
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
                  {t('machine.form.sectionMedia')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {pictures.map((pic, idx) => (
                    <Box
                      key={pic.name}
                      component="img"
                      src={`/api/file-upload/view-file/${pic.name}`}
                      alt={pic.name}
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
                  {t('machine.form.sectionDocuments')}
                </Typography>
                {documents.map((doc) => (
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
                    <a
                      href={`/api/file-upload/view-file/${doc.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconButton size="small">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </a>
                    <a
                      href={`/api/file-upload/view-file/${doc.name}`}
                      download={doc.name}
                    >
                      <IconButton size="small">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </a>
                  </Box>
                ))}
              </Paper>
            </Grid>
          )}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}
              >
                {t('machine.detail.currentMold')}
              </Typography>
              {mountedMold ? (
                <Box display="flex" alignItems="center" gap={1} py={0.5}>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ cursor: 'pointer', color: theme.palette.secondary.main, '&:hover': { textDecoration: 'underline' } }}
                    onClick={() => navigate(`/mold/${mountedMold.id}`)}
                  >
                    #{mountedMold.inventoryNumber} — {mountedMold.name}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('machine.detail.noMoldMounted')}
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}
                >
                  {t('machine.detail.attachedEquipment')}
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={openAssignDialog}
                >
                  {t('machine.detail.addEquipment')}
                </Button>
              </Box>

              {!machine.attachedEquipment || machine.attachedEquipment.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('machine.detail.noAttachedEquipment')}
                </Typography>
              ) : (
                machine.attachedEquipment.map((eq) => (
                  <Box
                    key={eq.id}
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
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {eq.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {eq.equipmentTypeName && `${t('machine.detail.equipmentType')}: ${eq.equipmentTypeName}`}
                        {eq.model && ` · ${eq.model}`}
                        {eq.serialNumber && ` · ${t('machine.detail.serialNumber')}: ${eq.serialNumber}`}
                      </Typography>
                    </Box>
                    <Tooltip title={t('machine.detail.unassign')}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleUnassign(eq.id)}
                        disabled={loading}
                      >
                        <LinkOffIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))
              )}
            </Paper>
          </Grid>
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
              src={`/api/file-upload/view-file/${pictures[lightboxIndex]?.name}`}
              alt={pictures[lightboxIndex]?.name}
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
            sx={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {lightboxIndex + 1} / {pictures.length}
          </Typography>
        </DialogContent>
      </Dialog>
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('machine.detail.assignDialogTitle')}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('machine.detail.searchEquipment')}
            value={equipmentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          {dialogLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={28} />
            </Box>
          ) : unassignedEquipment.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              {t('machine.detail.noUnassignedEquipment')}
            </Typography>
          ) : (
            <List disablePadding>
              {unassignedEquipment.map((eq) => (
                <ListItem
                  key={eq.id}
                  disablePadding
                  sx={{
                    py: 0.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                  secondaryAction={
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleAssign(eq.id)}
                      disabled={loading}
                    >
                      {t('machine.detail.assign')}
                    </Button>
                  }
                >
                  <ListItemText
                    primary={eq.name}
                    secondary={[
                      eq.equipmentTypeName,
                      eq.model,
                      eq.serialNumber && `${t('machine.detail.serialNumber')}: ${eq.serialNumber}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MachinePage;