import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Snackbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import ConfirmDialog from '@/reusableComponents/ConfirmDialog';
import DataGridCustomToolbar from '@/reusableComponents/DataGridCustomToolbar';
import Header from '@/reusableComponents/Header';
import { useDataGridLocaleText } from '@/reusableComponents/useDataGridLocaleText';
import { deleteCustomerOrder, fetchCustomerOrders } from '@/state/customerOrder/customerOrder.actions';
import {
  selectCustomerOrderError,
  selectCustomerOrderLoading,
  selectCustomerOrderSuccess,
  selectCustomerOrderTotal,
  selectCustomerOrders,
} from '@/state/customerOrder/customerOrder.selectors';
import { clearError, clearSuccess, resetState } from '@/state/customerOrder/customerOrder.slice';
import { CustomerOrder } from '@/state/customerOrder/customerOrder.types';
import { AppDispatch } from '@/state/store';

const statusColor = (status: string) => {
  if (status === 'fulfilled') return 'success';
  if (status === 'in_plan') return 'warning';
  return 'default';
};

const CustomerOrderList = () => {
  type SelectedItem = { id: string; name: string };

  const { t } = useTranslation();
  const localeText = useDataGridLocaleText();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch<AppDispatch>();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(isMobile ? 10 : 50);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');

  const orders = useSelector(selectCustomerOrders);
  const loading = useSelector(selectCustomerOrderLoading);
  const error = useSelector(selectCustomerOrderError);
  const success = useSelector(selectCustomerOrderSuccess);
  const total = useSelector(selectCustomerOrderTotal);

  useEffect(() => {
    if (isMobile && pageSize === 50) setPageSize(10);
  }, [isMobile, pageSize]);

  useEffect(() => {
    dispatch(fetchCustomerOrders({ page: page + 1, limit: pageSize, search }));
  }, [dispatch, page, pageSize, search]);

  useEffect(() => {
    if (success) {
      setNotification({ message: success, type: 'success' });
      dispatch(clearSuccess());
      dispatch(fetchCustomerOrders({ page: page + 1, limit: pageSize, search }));
    }
    if (error) {
      setNotification({ message: error, type: 'error' });
      dispatch(clearError());
    }
  }, [success, error, dispatch, page, pageSize, search]);

  useEffect(() => () => { dispatch(resetState()); }, [dispatch]);

  const columns = [
    { field: 'orderNumber', headerName: t('customerOrder.list.orderNumber'), width: 140 },
    { field: 'customerName', headerName: t('customerOrder.list.customer'), flex: 2, minWidth: 180 },
    {
      field: 'deliveryDate',
      headerName: t('customerOrder.list.deliveryDate'),
      width: 130,
      renderCell: (params: GridRenderCellParams<CustomerOrder>) =>
        params.row.deliveryDate ? new Date(params.row.deliveryDate).toLocaleDateString() : '—',
    },
    {
      field: 'status',
      headerName: t('customerOrder.list.status'),
      width: 130,
      renderCell: (params: GridRenderCellParams<CustomerOrder>) => (
        <Chip
          label={t(`customerOrder.status.${params.row.status}`)}
          color={statusColor(params.row.status)}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: t('customerOrder.list.createdAt'),
      width: 130,
      renderCell: (params: GridRenderCellParams<CustomerOrder>) =>
        new Date(params.row.createdAt).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: t('customerOrder.list.actions'),
      width: 110,
      sortable: false,
      renderCell: (params: GridRenderCellParams<CustomerOrder>) => (
        <Box>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/editCustomerOrder/${params.row.id}`); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              setSelected({ id: params.row.id, name: params.row.orderNumber });
              setOpen(true);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, pt: { xs: 1, sm: 2 }, pb: 1, display: 'flex', flexDirection: 'column', height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' } }}>
      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'} mb={2} gap={isMobile ? 2 : 0}>
        <Header title={t('customerOrder.list.title')} subtitle={t('customerOrder.list.subtitle')} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/addCustomerOrder')} fullWidth={isMobile} size={isMobile ? 'medium' : 'large'}>
          {t('customerOrder.list.add')}
        </Button>
      </Box>

      <Box width="100%" sx={{
        flexGrow: 1, minHeight: 0, overflow: 'auto',
        '& .MuiDataGrid-root': { border: 'none' },
        '& .MuiDataGrid-cell': { borderBottom: 'none' },
        '& .MuiDataGrid-columnHeaders': { backgroundColor: theme.palette.secondary[300], color: theme.palette.primary[600], borderBottom: 'none' },
        '& .MuiDataGrid-virtualScroller': { backgroundColor: theme.palette.background.paper },
        '& .MuiDataGrid-footerContainer': { backgroundColor: theme.palette.background.paper, color: theme.palette.secondary[100], borderTop: 'none' },
        '& .MuiDataGrid-toolbarContainer .MuiButton-text': { color: `${theme.palette.secondary[200]} !important` },
      }}>
        <DataGrid
          loading={loading}
          rows={orders}
          getRowId={(row) => row.id}
          columns={columns}
          onRowClick={(params) => navigate(`/customer-order/${params.row.id}`)}
          sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
          rowCount={total}
          rowsPerPageOptions={isMobile ? [10, 20] : [10, 20, 50]}
          pagination
          page={page}
          pageSize={pageSize}
          paginationMode="server"
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          components={{ Toolbar: DataGridCustomToolbar }}
          componentsProps={{ toolbar: { setSearch } }}
          density="comfortable"
          localeText={localeText}
        />
      </Box>

      <ConfirmDialog
        open={open}
        title={t('customerOrder.list.deleteTitle')}
        message={t('customerOrder.list.deleteDescription', { name: selected?.name })}
        onConfirm={() => { if (selected) { dispatch(deleteCustomerOrder(selected.id)); } setOpen(false); }}
        onClose={() => setOpen(false)}
      />

      <Snackbar open={!!notification} autoHideDuration={4000} onClose={() => setNotification(null)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={notification?.type} onClose={() => setNotification(null)} sx={{ width: '100%' }}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerOrderList;