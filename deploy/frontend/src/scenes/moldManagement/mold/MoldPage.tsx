import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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

import Header from '@/reusableComponents/Header';
import axiosServer from '@/services/axios.service';
import { fetchMachines } from '@/state/machine/machine.actions';
import { selectMachines } from '@/state/machine/machine.selectors';
import { fetchMoldById } from '@/state/mold/mold.actions';
import {
  selectCurrentMold,
  selectMoldError,
  selectMoldLoading,
} from '@/state/mold/mold.selectors';
import { resetState } from '@/state/mold/mold.slice';
import {
  createCompatibility,
  deleteCompatibility,
  fetchCompatibleMachines,
  updateCompatibility,
} from '@/state/moldMachineCompatibility/moldMachineCompatibility.actions';
import {
  selectCompatibilities,
  selectCompatibilityLoading,
} from '@/state/moldMachineCompatibility/moldMachineCompatibility.selectors';
import { MoldMachineCompatibility } from '@/state/moldMachineCompatibility/moldMachineCompatibility.types';
import { useAppDispatch } from '@/state/hooks';

const InfoRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <Box display="flex" py={0.75} borderBottom="1px solid" borderColor="divider">
    <Typography variant="body2" color="text.secondary" sx={{ width: 220, flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500}>
      {value ?? '—'}
    </Typography>
  </Box>
);

const statusColor = (status: string) => {
  if (status === 'ok') return 'success';
  if (status === 'repair') return 'warning';
  return 'error';
};

const sectionLabel = (text: string) => (
  <Typography
    variant="subtitle2"
    color="text.secondary"
    sx={{ mb: 1.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}
  >
    {text}
  </Typography>
);

const MoldPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const mold = useSelector(selectCurrentMold);
  const loading = useSelector(selectMoldLoading);
  const error = useSelector(selectMoldError);
  const compatibilities = useSelector(selectCompatibilities);
  const compatibilityLoading = useSelector(selectCompatibilityLoading);
  const allMachines = useSelector(selectMachines);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [producedItems, setProducedItems] = useState<{ id: string; itemCode: string; name: string }[]>([]);
  const [itemPieceWeights, setItemPieceWeights] = useState<Record<string, number>>({});

  // Assign dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [machineSearch, setMachineSearch] = useState('');
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [assignCycleTime, setAssignCycleTime] = useState('');
  const [assignStartupScrap, setAssignStartupScrap] = useState('');
  const [assignNormPerShift, setAssignNormPerShift] = useState('');
  const [assignRunnerWeightG, setAssignRunnerWeightG] = useState('');
  const [assignMoldMountingTime, setAssignMoldMountingTime] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<MoldMachineCompatibility | null>(null);
  const [editCycleTime, setEditCycleTime] = useState('');
  const [editStartupScrap, setEditStartupScrap] = useState('');
  const [editNormPerShift, setEditNormPerShift] = useState('');
  const [editRunnerWeightG, setEditRunnerWeightG] = useState('');
  const [editMoldMountingTime, setEditMoldMountingTime] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchMoldById(id));
      dispatch(fetchCompatibleMachines(id));
      axiosServer.get(`/item/produced-by/${id}`).then((res) => {
        if (res.data.success) setProducedItems(res.data.content.items ?? []);
      }).catch(() => {});
    }
    return () => { dispatch(resetState()); };
  }, [dispatch, id]);

  useEffect(() => {
    if (producedItems.length === 0) return;
    producedItems.forEach((item) => {
      axiosServer.get(`/item/${item.id}/bom`).then((res) => {
        if (res.data.success) {
          const lines: { quantityPerPiece: number; unit: string }[] = res.data.content?.bomLines ?? [];
          const weight = lines
            .filter((l) => l.unit.toLowerCase() === 'g')
            .reduce((sum, l) => sum + Number(l.quantityPerPiece), 0);
          setItemPieceWeights((prev) => ({ ...prev, [item.id]: weight }));
        }
      }).catch(() => {});
    });
  }, [producedItems]);

  const openAssignDialog = () => {
    setMachineSearch('');
    setSelectedMachineId('');
    setAssignCycleTime('');
    setAssignStartupScrap('');
    setAssignNormPerShift('');
    setAssignRunnerWeightG('');
    setAssignMoldMountingTime('');
    setAssignNotes('');
    setAssignOpen(true);
    dispatch(fetchMachines({ page: 1, limit: 200, search: '', sortField: '', sortOrder: '' }));
  };

  const assignedMachineIds = new Set(compatibilities.map((c) => c.machineId));

  const filteredMachines = allMachines.filter(
    (m) =>
      !assignedMachineIds.has(m.id) &&
      (machineSearch === '' ||
        m.name.toLowerCase().includes(machineSearch.toLowerCase()) ||
        String(m.machineNumber).includes(machineSearch)),
  );

  const handleAssignConfirm = async () => {
    if (!id || !selectedMachineId) return;
    const result = await dispatch(
      createCompatibility({
        moldId: id,
        machineId: selectedMachineId,
        cycleTimeSeconds: assignCycleTime !== '' ? Number(assignCycleTime) : null,
        startupScrapCount: assignStartupScrap !== '' ? Number(assignStartupScrap) : null,
        normPerShift: assignNormPerShift !== '' ? Number(assignNormPerShift) : null,
        runnerWeightG: assignRunnerWeightG !== '' ? Number(assignRunnerWeightG) : null,
        moldMountingTimeMinutes: assignMoldMountingTime !== '' ? Number(assignMoldMountingTime) : null,
        notes: assignNotes || null,
      }),
    );
    if (createCompatibility.fulfilled.match(result)) {
      setAssignOpen(false);
      dispatch(fetchCompatibleMachines(id));
    }
  };

  const openEditDialog = (item: MoldMachineCompatibility) => {
    setEditItem(item);
    setEditCycleTime(item.cycleTimeSeconds !== null ? String(item.cycleTimeSeconds) : '');
    setEditStartupScrap(item.startupScrapCount !== null ? String(item.startupScrapCount) : '');
    setEditNormPerShift(item.normPerShift !== null ? String(item.normPerShift) : '');
    setEditRunnerWeightG(item.runnerWeightG !== null ? String(item.runnerWeightG) : '');
    setEditMoldMountingTime(item.moldMountingTimeMinutes !== null ? String(item.moldMountingTimeMinutes) : '');
    setEditNotes(item.notes ?? '');
    setEditOpen(true);
  };

  const handleEditConfirm = async () => {
    if (!id || !editItem) return;
    const result = await dispatch(
      updateCompatibility({
        id: editItem.id,
        cycleTimeSeconds: editCycleTime !== '' ? Number(editCycleTime) : null,
        startupScrapCount: editStartupScrap !== '' ? Number(editStartupScrap) : null,
        normPerShift: editNormPerShift !== '' ? Number(editNormPerShift) : null,
        runnerWeightG: editRunnerWeightG !== '' ? Number(editRunnerWeightG) : null,
        moldMountingTimeMinutes: editMoldMountingTime !== '' ? Number(editMoldMountingTime) : null,
        notes: editNotes || null,
      }),
    );
    if (updateCompatibility.fulfilled.match(result)) {
      setEditOpen(false);
      dispatch(fetchCompatibleMachines(id));
    }
  };

  const handleDelete = async (compatibilityId: string) => {
    if (!id) return;
    const result = await dispatch(deleteCompatibility(compatibilityId));
    if (deleteCompatibility.fulfilled.match(result)) {
      dispatch(fetchCompatibleMachines(id));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m="1.5rem 2.5rem">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!mold) return null;

  const pictures = Array.isArray(mold.pictures) ? mold.pictures : [];
  const documents = Array.isArray(mold.documents) ? mold.documents : [];

  return (
    <Box m="1.5rem 2.5rem">
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} mb={2}>
        <Header
          title={`#${mold.inventoryNumber} — ${mold.name}`}
          subtitle={t('mold.page.subtitle')}
        />
        <Box display="flex" gap={1}>
          <Button startIcon={<ArrowBackIcon />} variant="outlined" color="secondary" size="small" onClick={() => navigate('/mold')}>
            {t('mold.actions.back')}
          </Button>
          <Button startIcon={<EditIcon />} variant="contained" size="small" onClick={() => navigate(`/editMold/${mold.id}`)}>
            {t('mold.actions.edit')}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.background.paper }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              {t('mold.form.sectionBasic')}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="body2" color="text.secondary" sx={{ width: 220, flexShrink: 0 }}>
                {t('mold.form.status')}
              </Typography>
              <Chip
                label={t(`mold.status.${mold.status}`)}
                color={statusColor(mold.status) as 'success' | 'warning' | 'error'}
                size="small"
              />
            </Box>
            <InfoRow label={t('mold.form.serviceCategory')} value={mold.serviceCategory} />
            <InfoRow label={t('mold.form.pieceCounter')} value={mold.pieceCounter} />
            <InfoRow label={t('mold.form.notes')} value={mold.notes} />
            <Box display="flex" py={0.75} borderBottom="1px solid" borderColor="divider" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ width: 220, flexShrink: 0 }}>
                {t('mold.form.currentMachine')}
              </Typography>
              {mold.currentMachineId && mold.currentMachineName ? (
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ cursor: 'pointer', color: theme.palette.secondary.main, '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate(`/machine/${mold.currentMachineId}`)}
                >
                  #{mold.currentMachineNumber} — {mold.currentMachineName}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">{t('mold.form.notMounted')}</Typography>
              )}
            </Box>
            <Box display="flex" py={0.75} borderBottom="1px solid" borderColor="divider" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ width: 220, flexShrink: 0 }}>
                {t('mold.form.ownedByCompany')}
              </Typography>
              {mold.ownedByCompanyId && mold.ownedByCompanyName ? (
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ cursor: 'pointer', color: theme.palette.secondary.main, '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate(`/company/${mold.ownedByCompanyId}`)}
                >
                  {mold.ownedByCompanyName}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">{t('mold.form.noOwner')}</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.background.paper }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              {t('mold.form.sectionDimensions')}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <InfoRow label={t('mold.form.cavities')} value={mold.cavities} />
            <InfoRow label={`${t('mold.form.heightMM')} (mm)`} value={mold.heightMM} />
            <InfoRow label={`${t('mold.form.widthMM')} (mm)`} value={mold.widthMM} />
            <InfoRow label={`${t('mold.form.depthMM')} (mm)`} value={mold.depthMM} />
            <InfoRow label={`${t('mold.form.weight')} (kg)`} value={mold.weight} />
            <InfoRow label={`${t('mold.form.centeringDiameterMM')} (mm)`} value={mold.centeringDiameterMM} />
            <InfoRow label={`${t('mold.form.requiredClampingForceKN')} (kN)`} value={mold.requiredClampingForceKN} />
          </Paper>
        </Grid>

        {mold.temperingTemperatures && mold.temperingTemperatures.length > 0 && (
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.background.paper }}>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                {t('mold.form.sectionTempering')}
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('mold.form.zone')}</TableCell>
                    <TableCell align="right">{t('mold.form.minTemp')} (°C)</TableCell>
                    <TableCell align="right">{t('mold.form.maxTemp')} (°C)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mold.temperingTemperatures.map((zone, i) => (
                    <TableRow key={i}>
                      <TableCell>{zone.zone}</TableCell>
                      <TableCell align="right">{zone.minTemp}</TableCell>
                      <TableCell align="right">{zone.maxTemp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        )}

        {pictures.length > 0 && (
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.background.paper }}>
              {sectionLabel(t('mold.form.sectionMedia'))}
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
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.background.paper }}>
              {sectionLabel(t('mold.form.sectionDocuments'))}
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
                  <a href={`/api/file-upload/view-file/${doc.name}`} target="_blank" rel="noopener noreferrer">
                    <IconButton size="small">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </a>
                  <a href={`/api/file-upload/view-file/${doc.name}`} download={doc.name}>
                    <IconButton size="small">
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </a>
                </Box>
              ))}
            </Paper>
          </Grid>
        )}

        {/* Compatible Machines panel */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.background.paper }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}
              >
                {t('mold.form.sectionCompatibleMachines')}
              </Typography>
              <Button variant="outlined" color="secondary" size="small" onClick={openAssignDialog}>
                {t('mold.form.addCompatibleMachine')}
              </Button>
            </Box>

            {compatibilityLoading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : compatibilities.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('mold.form.noCompatibleMachines')}
              </Typography>
            ) : (
              compatibilities.map((item) => (
                <Box
                  key={item.id}
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
                      {item.machineName}
                      {item.machineNumber !== undefined && (
                        <Typography component="span" variant="caption" color="text.secondary" ml={0.5}>
                          #{item.machineNumber}
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {[
                        item.cycleTimeSeconds !== null &&
                          `${t('mold.form.cycleTimeSeconds')}: ${item.cycleTimeSeconds}s`,
                        item.startupScrapCount !== null &&
                          `${t('mold.form.startupScrapCount')}: ${item.startupScrapCount}`,
                        item.normPerShift !== null &&
                          `${t('mold.form.normPerShift')}: ${item.normPerShift}`,
                        item.runnerWeightG !== null &&
                          `${t('mold.form.runnerWeightG')}: ${item.runnerWeightG}g`,
                        item.moldMountingTimeMinutes !== null &&
                          `${t('mold.form.moldMountingTimeMinutes')}: ${item.moldMountingTimeMinutes}min`,
                        item.notes,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  </Box>
                  <Tooltip title={t('mold.actions.edit')}>
                    <IconButton size="small" onClick={() => openEditDialog(item)} disabled={compatibilityLoading}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('mold.actions.delete')}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item.id)}
                      disabled={compatibilityLoading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        {/* Produced Items panel */}
        {producedItems.length > 0 && (
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.background.paper }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
                {t('mold.detail.producedItems')}
              </Typography>
              {producedItems.map((pi) => (
                <Box key={pi.id} sx={{ display: 'flex', alignItems: 'center', py: 0.75, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ flex: 1, cursor: 'pointer', color: theme.palette.secondary.main, '&:hover': { textDecoration: 'underline' } }}
                    onClick={() => navigate(`/item/${pi.id}`)}
                  >
                    {pi.itemCode} — {pi.name}
                  </Typography>
                  {itemPieceWeights[pi.id] != null && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 160, textAlign: 'right', flexShrink: 0 }}>
                        {t('mold.form.pieceWeightG')} ({t('mold.form.fromBom')}):
                      </Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ minWidth: 60, textAlign: 'right' }}>
                        {(itemPieceWeights[pi.id] ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 })} g
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Lightbox dialog */}
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
                sx={{ position: 'absolute', left: 8, color: 'white', backgroundColor: 'rgba(0,0,0,0.4)' }}
              >
                <NavigateBeforeIcon />
              </IconButton>
              <IconButton
                onClick={() => setLightboxIndex((prev) => (prev + 1) % pictures.length)}
                sx={{ position: 'absolute', right: 8, color: 'white', backgroundColor: 'rgba(0,0,0,0.4)' }}
              >
                <NavigateNextIcon />
              </IconButton>
            </>
          )}
          <Typography
            variant="caption"
            sx={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', color: 'white' }}
          >
            {lightboxIndex + 1} / {pictures.length}
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Assign dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('mold.form.addCompatibleMachine')}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('common.search')}
            value={machineSearch}
            onChange={(e) => setMachineSearch(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          {filteredMachines.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              {t('mold.form.noCompatibleMachines')}
            </Typography>
          ) : (
            <List disablePadding sx={{ mb: 2 }}>
              {filteredMachines.map((m) => (
                <ListItem
                  key={m.id}
                  disablePadding
                  onClick={() => setSelectedMachineId(m.id)}
                  sx={{
                    py: 0.5,
                    px: 1,
                    cursor: 'pointer',
                    borderRadius: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                    backgroundColor:
                      selectedMachineId === m.id
                        ? theme.palette.action.selected
                        : 'transparent',
                    '&:hover': { backgroundColor: theme.palette.action.hover },
                  }}
                >
                  <ListItemText
                    primary={m.name}
                    secondary={`#${m.machineNumber}`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Box display="flex" gap={2} mt={2}>
            <TextField
              label={t('mold.form.cycleTimeSeconds')}
              type="number"
              size="small"
              value={assignCycleTime}
              onChange={(e) => setAssignCycleTime(e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ min: 0 }}
            />
            <TextField
              label={t('mold.form.startupScrapCount')}
              type="number"
              size="small"
              value={assignStartupScrap}
              onChange={(e) => setAssignStartupScrap(e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ min: 0 }}
            />
            <TextField
              label={t('mold.form.normPerShift')}
              type="number"
              size="small"
              value={assignNormPerShift}
              onChange={(e) => setAssignNormPerShift(e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ min: 1 }}
            />
          </Box>
          <Box display="flex" gap={2} mt={2} alignItems="flex-start">
            <TextField
              label={`${t('mold.form.runnerWeightG')} (g)`}
              type="number"
              size="small"
              value={assignRunnerWeightG}
              onChange={(e) => setAssignRunnerWeightG(e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ min: 0, step: 'any' }}
            />
            {producedItems.map((item) => (
              <TextField
                key={item.id}
                label={`${t('mold.form.pieceWeightG')} — ${item.itemCode}`}
                size="small"
                value={`${(itemPieceWeights[item.id] ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 })} g`}
                sx={{ flex: 1 }}
                slotProps={{ input: { readOnly: true } }}
              />
            ))}
          </Box>
          <TextField
            label={t('mold.form.moldMountingTimeMinutes')}
            type="number"
            size="small"
            fullWidth
            value={assignMoldMountingTime}
            onChange={(e) => setAssignMoldMountingTime(e.target.value)}
            sx={{ mt: 2 }}
            inputProps={{ min: 0 }}
          />
          <TextField
            label={t('mold.form.notes')}
            size="small"
            fullWidth
            multiline
            rows={2}
            value={assignNotes}
            onChange={(e) => setAssignNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)} color="inherit">{t('common.cancel')}</Button>
          <Button
            variant="contained"
            disabled={!selectedMachineId || compatibilityLoading}
            onClick={handleAssignConfirm}
          >
            {t('mold.form.addCompatibleMachine')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('mold.actions.edit')}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {editItem && (
            <Typography variant="body2" fontWeight={500} mb={2}>
              {editItem.machineName}
              {editItem.machineNumber !== undefined && (
                <Typography component="span" variant="caption" color="text.secondary" ml={0.5}>
                  #{editItem.machineNumber}
                </Typography>
              )}
            </Typography>
          )}
          <Box display="flex" gap={2}>
            <TextField
              label={t('mold.form.cycleTimeSeconds')}
              type="number"
              size="small"
              value={editCycleTime}
              onChange={(e) => setEditCycleTime(e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ min: 0 }}
            />
            <TextField
              label={t('mold.form.startupScrapCount')}
              type="number"
              size="small"
              value={editStartupScrap}
              onChange={(e) => setEditStartupScrap(e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ min: 0 }}
            />
            <TextField
              label={t('mold.form.normPerShift')}
              type="number"
              size="small"
              value={editNormPerShift}
              onChange={(e) => setEditNormPerShift(e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ min: 1 }}
            />
          </Box>
          <Box display="flex" gap={2} mt={2} alignItems="flex-start">
            <TextField
              label={`${t('mold.form.runnerWeightG')} (g)`}
              type="number"
              size="small"
              value={editRunnerWeightG}
              onChange={(e) => setEditRunnerWeightG(e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ min: 0, step: 'any' }}
            />
            {producedItems.map((item) => (
              <TextField
                key={item.id}
                label={`${t('mold.form.pieceWeightG')} — ${item.itemCode}`}
                size="small"
                value={`${(itemPieceWeights[item.id] ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 })} g`}
                sx={{ flex: 1 }}
                slotProps={{ input: { readOnly: true } }}
              />
            ))}
          </Box>
          <TextField
            label={t('mold.form.moldMountingTimeMinutes')}
            type="number"
            size="small"
            fullWidth
            value={editMoldMountingTime}
            onChange={(e) => setEditMoldMountingTime(e.target.value)}
            sx={{ mt: 2 }}
            inputProps={{ min: 0 }}
          />
          <TextField
            label={t('mold.form.notes')}
            size="small"
            fullWidth
            multiline
            rows={2}
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} color="inherit">{t('common.cancel')}</Button>
          <Button
            variant="contained"
            disabled={compatibilityLoading}
            onClick={handleEditConfirm}
          >
            {t('mold.actions.edit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MoldPage;