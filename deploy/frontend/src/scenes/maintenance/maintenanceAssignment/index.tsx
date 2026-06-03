import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@/state/hooks';
import {
  deleteMaintenanceAssignment,
  fetchMaintenanceAssignments,
} from '@/state/maintenanceAssignment/maintenanceAssignment.actions';
import {
  selectMaintenanceAssignmentError,
  selectMaintenanceAssignmentLoading,
  selectMaintenanceAssignments,
  selectMaintenanceAssignmentSuccess,
  selectMaintenanceAssignmentTotal,
} from '@/state/maintenanceAssignment/maintenanceAssignment.selectors';
import { clearError, clearSuccess } from '@/state/maintenanceAssignment/maintenanceAssignment.slice';
import { MaintenanceAssignment } from '@/state/maintenanceAssignment/maintenanceAssignment.types';

const PAGE_SIZE = 20;

const TARGET_TYPE_COLORS: Record<string, 'primary' | 'secondary' | 'warning' | 'success'> = {
  machine:   'primary',
  equipment: 'secondary',
  mold:      'warning',
  vehicle:   'success',
};

const MaintenanceAssignmentList = () => {
  const { t }    = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const assignments = useSelector(selectMaintenanceAssignments);
  const total       = useSelector(selectMaintenanceAssignmentTotal);
  const loading     = useSelector(selectMaintenanceAssignmentLoading);
  const error       = useSelector(selectMaintenanceAssignmentError);
  const success     = useSelector(selectMaintenanceAssignmentSuccess);

  const [page, setPage]         = useState(0);
  const [search, setSearch]     = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMaintenanceAssignments({ page: page + 1, limit: PAGE_SIZE, search }));
  }, [dispatch, page, search]);

  useEffect(() => {
    if (success) {
      dispatch(fetchMaintenanceAssignments({ page: page + 1, limit: PAGE_SIZE, search }));
      dispatch(clearSuccess());
    }
  }, [success, dispatch, page, search]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await dispatch(deleteMaintenanceAssignment(deleteId));
    setDeleteId(null);
  };

  const columns: GridColDef[] = [
    { field: 'templateName', headerName: t('maintenanceAssignment.templateName'), flex: 2, minWidth: 180 },
    {
      field: 'targetType',
      headerName: t('maintenanceAssignment.targetType'),
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<MaintenanceAssignment>) => (
        <Chip
          label={t(`maintenanceAssignment.targetTypes.${params.row.targetType}`)}
          size="small"
          color={TARGET_TYPE_COLORS[params.row.targetType] ?? 'default'}
          variant="outlined"
        />
      ),
    },
    { field: 'targetName', headerName: t('maintenanceAssignment.targetName'), flex: 2, minWidth: 180 },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 70,
      renderCell: (params: GridRenderCellParams<MaintenanceAssignment>) => (
        <DeleteIcon
          fontSize="small"
          sx={{ cursor: 'pointer', color: 'error.main' }}
          onClick={() => setDeleteId(params.row.id)}
        />
      ),
    },
  ];

  return (
    <Box m="1.5rem 2.5rem">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">{t('maintenanceAssignment.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/maintenance-assignment/add')}>
          {t('maintenanceAssignment.add')}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box mb={2}>
        <TextField
          size="small"
          label={t('common.search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ width: 300 }}
        />
      </Box>

      <DataGrid
        autoHeight
        rows={assignments}
        columns={columns}
        rowCount={total}
        loading={loading}
        pagination
        page={page}
        pageSize={PAGE_SIZE}
        paginationMode="server"
        onPageChange={setPage}
        rowsPerPageOptions={[PAGE_SIZE]}
        disableSelectionOnClick
        sx={{ minHeight: 400 }}
      />

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>{t('common.confirm')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('maintenanceAssignment.deleteConfirm')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>{t('common.cancel')}</Button>
          <Button color="error" onClick={handleDelete}>{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenanceAssignmentList;