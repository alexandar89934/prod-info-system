import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchItems, fetchItemById, fetchBomLines, addBomLine, updateBomLine, deleteBomLine } from '@/state/item/item.actions';
import {
  selectBomLines,
  selectCurrentItem,
  selectItemError,
  selectItemLoading,
  selectItems,
} from '@/state/item/item.selectors';
import { clearError, resetState } from '@/state/item/item.slice';
import { BomLine } from '@/state/item/item.types';
import { useAppDispatch } from '@/state/hooks';
import { ITEM_UNITS } from '@/zodValidationSchemas/item.schema';

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

const categoryColor = (cat: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
  const map: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
    raw_material: 'default',
    masterbatch: 'info',
    component: 'primary',
    semi_finished: 'warning',
    finished_good: 'success',
    regrind: 'secondary',
    packaging: 'error',
  };
  return map[cat] ?? 'default';
};

const sectionLabel = (text: string) => (
  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
    {text}
  </Typography>
);

const emptyBomLine = { outputItemId: '', inputItemId: '', quantityPerPiece: 1, unit: 'kom' as const, notes: '' };

const ItemPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const item = useSelector(selectCurrentItem);
  const loading = useSelector(selectItemLoading);
  const error = useSelector(selectItemError);
  const bomLines = useSelector(selectBomLines);
  const allItems = useSelector(selectItems);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<BomLine | null>(null);

  const [formData, setFormData] = useState(emptyBomLine);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchItemById(id));
      dispatch(fetchBomLines(id));
      dispatch(fetchItems({ page: 1, limit: 500, search: '', sortField: 'itemCode', sortOrder: 'asc' }));
    }
    return () => { dispatch(resetState()); };
  }, [dispatch, id]);

  useEffect(() => {
    if (error) dispatch(clearError());
  }, [error, dispatch]);

  const openAddDialog = () => {
    setFormData({ ...emptyBomLine, outputItemId: id ?? '' });
    setFormError(null);
    setAddOpen(true);
  };

  const openEditDialog = (line: BomLine) => {
    setEditingLine(line);
    setFormData({
      outputItemId: line.outputItemId,
      inputItemId: line.inputItemId,
      quantityPerPiece: line.quantityPerPiece,
      unit: line.unit as typeof emptyBomLine.unit,
      notes: line.notes ?? '',
    });
    setFormError(null);
    setEditOpen(true);
  };

  const handleAddConfirm = async () => {
    if (!formData.inputItemId) { setFormError(t('item.bom.inputRequired')); return; }
    if (!formData.quantityPerPiece || formData.quantityPerPiece <= 0) { setFormError(t('item.bom.quantityPositive')); return; }
    const result = await dispatch(addBomLine({
      outputItemId: id ?? '',
      inputItemId: formData.inputItemId,
      quantityPerPiece: Number(formData.quantityPerPiece),
      unit: formData.unit,
      notes: formData.notes || null,
    }));
    if (addBomLine.fulfilled.match(result)) {
      setAddOpen(false);
      dispatch(fetchBomLines(id ?? ''));
    } else {
      setFormError(result.payload as string);
    }
  };

  const handleEditConfirm = async () => {
    if (!editingLine) return;
    if (!formData.inputItemId) { setFormError(t('item.bom.inputRequired')); return; }
    if (!formData.quantityPerPiece || formData.quantityPerPiece <= 0) { setFormError(t('item.bom.quantityPositive')); return; }
    const result = await dispatch(updateBomLine({
      id: editingLine.id ?? '',
      outputItemId: editingLine.outputItemId,
      inputItemId: formData.inputItemId,
      quantityPerPiece: Number(formData.quantityPerPiece),
      unit: formData.unit,
      notes: formData.notes || null,
    }));
    if (updateBomLine.fulfilled.match(result)) {
      setEditOpen(false);
      setEditingLine(null);
      dispatch(fetchBomLines(id ?? ''));
    } else {
      setFormError(result.payload as string);
    }
  };

  const handleDeleteLine = async (lineId: string) => {
    const result = await dispatch(deleteBomLine({ outputItemId: id ?? '', id: lineId }));
    if (deleteBomLine.fulfilled.match(result)) {
      dispatch(fetchBomLines(id ?? ''));
    }
  };

  const addedInputIds = new Set(bomLines.map((l) => l.inputItemId));
  const availableInputItems = allItems.filter((i) => i.id !== id);
  const addableInputItems = availableInputItems.filter((i) => !addedInputIds.has(i.id ?? ''));
  const editableInputItems = (editingLine: BomLine | null) =>
    availableInputItems.filter((i) => !addedInputIds.has(i.id ?? '') || i.id === editingLine?.inputItemId);

  if (loading && !item) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>;
  }

  if (!item) {
    return <Box p={3}><Alert severity="error">{error ?? t('item.detail.notFound')}</Alert></Box>;
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Button startIcon={<ArrowBackIcon />} variant="outlined" color="secondary" size="small" onClick={() => navigate('/item')}>
          {t('item.detail.back')}
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={600}>{item.name}</Typography>
          <Typography variant="body2" color="text.secondary">{item.itemCode}</Typography>
        </Box>
        <Button startIcon={<EditIcon />} variant="contained" onClick={() => navigate(`/editItem/${id}`)}>
          {t('item.detail.edit')}
        </Button>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pb: 2 }}>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        {sectionLabel(t('item.form.sectionIdentity'))}
        <InfoRow label={t('item.form.itemCode')} value={item.itemCode} />
        <InfoRow label={t('item.form.name')} value={item.name} />
        <Box display="flex" py={0.75} borderBottom="1px solid" borderColor="divider">
          <Typography variant="body2" color="text.secondary" sx={{ width: 220, flexShrink: 0 }}>
            {t('item.form.category')}
          </Typography>
          <Chip label={t(`item.category.${item.category}`)} color={categoryColor(item.category)} size="small" />
        </Box>
        <InfoRow label={t('item.form.unit')} value={item.unit} />
        <InfoRow label={t('item.form.approvalLevel')} value={item.approvalLevel ? t(`item.approvalLevel.${item.approvalLevel}`) : null} />

        {sectionLabel(t('item.form.sectionPricing'))}
        <InfoRow label={`${t('item.form.priceEurPerUnit')} (€)`} value={item.priceEurPerUnit != null ? Number(item.priceEurPerUnit).toFixed(4) : null} />

        {item.toolName && (
          <Box display="flex" py={0.75} borderBottom="1px solid" borderColor="divider">
            <Typography variant="body2" color="text.secondary" sx={{ width: 220, flexShrink: 0 }}>
              {t('item.form.tool')}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{ cursor: 'pointer', color: theme.palette.secondary.main, '&:hover': { textDecoration: 'underline' } }}
              onClick={() => navigate(`/mold/${item.toolId}`)}
            >
              #{item.toolInventoryNumber} — {item.toolName}
            </Typography>
          </Box>
        )}

        {item.notes && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" color="text.secondary">{item.notes}</Typography>
          </>
        )}
      </Paper>

      {/* BOM Section */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          {sectionLabel(t('item.bom.title'))}
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>
            {t('item.bom.add')}
          </Button>
        </Box>

        {bomLines.length === 0 ? (
          <Typography variant="body2" color="text.secondary">{t('item.bom.empty')}</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('item.bom.inputItem')}</TableCell>
                <TableCell>{t('item.bom.quantity')}</TableCell>
                <TableCell>{t('item.bom.unit')}</TableCell>
                <TableCell>{t('item.bom.notes')}</TableCell>
                <TableCell align="right">{t('item.bom.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bomLines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{line.inputItemCode}</Typography>
                    <Typography variant="caption" color="text.secondary">{line.inputItemName}</Typography>
                  </TableCell>
                  <TableCell>{Number(line.quantityPerPiece)}</TableCell>
                  <TableCell>{line.unit}</TableCell>
                  <TableCell>{line.notes ?? '—'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEditDialog(line)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteLine(line.id ?? '')}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
      </Box>

      {/* Add BOM line dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('item.bom.addTitle')}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('item.bom.inputItem')}</InputLabel>
              <Select
                value={formData.inputItemId}
                label={t('item.bom.inputItem')}
                onChange={(e: SelectChangeEvent) => setFormData((prev) => ({ ...prev, inputItemId: e.target.value }))}
              >
                {addableInputItems.map((i) => (
                  <MenuItem key={i.id} value={i.id ?? ''}>{i.itemCode} — {i.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('item.bom.quantity')}
              type="number"
              size="small"
              value={formData.quantityPerPiece}
              onChange={(e) => setFormData((prev) => ({ ...prev, quantityPerPiece: Number(e.target.value) }))}
              inputProps={{ min: 0, step: 'any' }}
            />
            <FormControl fullWidth size="small">
              <InputLabel>{t('item.bom.unit')}</InputLabel>
              <Select
                value={formData.unit}
                label={t('item.bom.unit')}
                onChange={(e: SelectChangeEvent) => setFormData((prev) => ({ ...prev, unit: e.target.value as typeof emptyBomLine.unit }))}
              >
                {ITEM_UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label={t('item.bom.notes')}
              size="small"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setAddOpen(false)}>{t('item.bom.cancel')}</Button>
          <Button variant="contained" onClick={handleAddConfirm} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : t('item.bom.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit BOM line dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('item.bom.editTitle')}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('item.bom.inputItem')}</InputLabel>
              <Select
                value={formData.inputItemId}
                label={t('item.bom.inputItem')}
                onChange={(e: SelectChangeEvent) => setFormData((prev) => ({ ...prev, inputItemId: e.target.value }))}
              >
                {editableInputItems(editingLine).map((i) => (
                  <MenuItem key={i.id} value={i.id ?? ''}>{i.itemCode} — {i.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('item.bom.quantity')}
              type="number"
              size="small"
              value={formData.quantityPerPiece}
              onChange={(e) => setFormData((prev) => ({ ...prev, quantityPerPiece: Number(e.target.value) }))}
              inputProps={{ min: 0, step: 'any' }}
            />
            <FormControl fullWidth size="small">
              <InputLabel>{t('item.bom.unit')}</InputLabel>
              <Select
                value={formData.unit}
                label={t('item.bom.unit')}
                onChange={(e: SelectChangeEvent) => setFormData((prev) => ({ ...prev, unit: e.target.value as typeof emptyBomLine.unit }))}
              >
                {ITEM_UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label={t('item.bom.notes')}
              size="small"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setEditOpen(false)}>{t('item.bom.cancel')}</Button>
          <Button variant="contained" onClick={handleEditConfirm} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : t('item.bom.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ItemPage;