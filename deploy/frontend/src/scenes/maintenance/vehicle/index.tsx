import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
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
import { deleteVehicle, fetchVehicles } from '@/state/vehicle/vehicle.actions';
import {
  selectVehicleError,
  selectVehicleLoading,
  selectVehicles,
  selectVehicleSuccess,
  selectVehicleTotal,
} from '@/state/vehicle/vehicle.selectors';
import { clearError, clearSuccess } from '@/state/vehicle/vehicle.slice';
import { Vehicle } from '@/state/vehicle/vehicle.types';

const PAGE_SIZE = 20;

const VehicleList = () => {
  const { t }    = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const vehicles = useSelector(selectVehicles);
  const total    = useSelector(selectVehicleTotal);
  const loading  = useSelector(selectVehicleLoading);
  const error    = useSelector(selectVehicleError);
  const success  = useSelector(selectVehicleSuccess);

  const [page, setPage]         = useState(0);
  const [search, setSearch]     = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchVehicles({ page: page + 1, limit: PAGE_SIZE, search }));
  }, [dispatch, page, search]);

  useEffect(() => {
    if (success) {
      dispatch(fetchVehicles({ page: page + 1, limit: PAGE_SIZE, search }));
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
    await dispatch(deleteVehicle(deleteId));
    setDeleteId(null);
  };

  const columns: GridColDef[] = [
    { field: 'name',              headerName: t('vehicle.name'),              flex: 1.5, minWidth: 150 },
    {
      field: 'type',
      headerName: t('vehicle.type'),
      flex: 1,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<Vehicle>) => (
        <span>{t(`vehicle.types.${params.row.type}`)}</span>
      ),
    },
    { field: 'licensePlate',      headerName: t('vehicle.licensePlate'),      flex: 1,   minWidth: 120 },
    { field: 'model',             headerName: t('vehicle.model'),             flex: 1,   minWidth: 120 },
    { field: 'yearOfManufacture', headerName: t('vehicle.yearOfManufacture'), flex: 0.8, minWidth: 100 },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 100,
      renderCell: (params: GridRenderCellParams<Vehicle>) => (
        <Box display="flex" gap={1}>
          <EditIcon
            fontSize="small"
            sx={{ cursor: 'pointer', color: 'primary.main' }}
            onClick={() => navigate(`/vehicle/edit/${params.row.id}`)}
          />
          <DeleteIcon
            fontSize="small"
            sx={{ cursor: 'pointer', color: 'error.main' }}
            onClick={() => setDeleteId(params.row.id)}
          />
        </Box>
      ),
    },
  ];

  return (
    <Box m="1.5rem 2.5rem">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">{t('vehicle.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/vehicle/add')}>
          {t('vehicle.add')}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box display="flex" gap={2} mb={2}>
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
        rows={vehicles}
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
          <DialogContentText>{t('vehicle.deleteConfirm')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>{t('common.cancel')}</Button>
          <Button color="error" onClick={handleDelete}>{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehicleList;