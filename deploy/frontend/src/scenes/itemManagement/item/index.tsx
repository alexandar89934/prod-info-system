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
import { deleteItem, fetchItems } from '@/state/item/item.actions';
import {
  selectItemError,
  selectItemLoading,
  selectItemSuccess,
  selectItemTotal,
  selectItems,
} from '@/state/item/item.selectors';
import { clearError, clearSuccess, resetState } from '@/state/item/item.slice';
import { Item } from '@/state/item/item.types';
import { AppDispatch } from '@/state/store';

const categoryColor = (cat: string) => {
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

const ItemList = () => {
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
  const [sortModel, setSortModel] = useState<{ field: string; sort: string }[]>([]);

  const items = useSelector(selectItems);
  const loading = useSelector(selectItemLoading);
  const error = useSelector(selectItemError);
  const success = useSelector(selectItemSuccess);
  const total = useSelector(selectItemTotal);

  const sortField = sortModel[0]?.field ?? '';
  const sortOrder = sortModel[0]?.sort ?? '';

  useEffect(() => {
    dispatch(fetchItems({ page: page + 1, limit: pageSize, search, sortField, sortOrder }));
  }, [dispatch, page, pageSize, search, sortField, sortOrder]);

  useEffect(() => {
    if (success) {
      setNotification({ message: success, type: 'success' });
      dispatch(clearSuccess());
      dispatch(fetchItems({ page: page + 1, limit: pageSize, search, sortField, sortOrder }));
    }
    if (error) {
      setNotification({ message: error, type: 'error' });
      dispatch(clearError());
    }
  }, [success, error, dispatch, page, pageSize, search, sortField, sortOrder]);

  useEffect(() => () => { dispatch(resetState()); }, [dispatch]);

  const handleDeleteClick = (item: Item) => {
    setSelected({ id: item.id ?? '', name: item.name });
    setOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selected) return;
    await dispatch(deleteItem(selected.id));
    setOpen(false);
    setSelected(null);
  };

  const columns = [
    {
      field: 'itemCode',
      headerName: t('item.list.itemCode'),
      flex: 0.7,
      minWidth: 90,
    },
    {
      field: 'name',
      headerName: t('item.list.name'),
      flex: 1.5,
      minWidth: 160,
    },
    {
      field: 'category',
      headerName: t('item.list.category'),
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<Item>) => (
        <Chip
          label={t(`item.category.${params.row.category}`)}
          color={categoryColor(params.row.category)}
          size="small"
        />
      ),
    },
    {
      field: 'unit',
      headerName: t('item.list.unit'),
      flex: 0.5,
      minWidth: 60,
    },
    {
      field: 'priceEurPerUnit',
      headerName: t('item.list.price'),
      flex: 0.7,
      minWidth: 80,
      renderCell: (params: GridRenderCellParams<Item>) => (
        params.row.priceEurPerUnit != null ? `€${Number(params.row.priceEurPerUnit).toFixed(4)}` : '—'
      ),
    },
    {
      field: 'toolName',
      headerName: t('item.list.tool'),
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<Item>) =>
        params.row.toolName ? `#${params.row.toolInventoryNumber} ${params.row.toolName}` : '—',
    },
    {
      field: 'actions',
      headerName: t('item.list.actions'),
      flex: 0.6,
      minWidth: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Item>) => (
        <Box>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); navigate(`/editItem/${params.row.id}`); }}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(params.row); }}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ px: { xs: 1, sm: 2.5 }, pt: { xs: 1, sm: 2 }, pb: 1, display: 'flex', flexDirection: 'column', height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' } }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} mb={1}>
        <Header title={t('item.list.title')} subtitle={t('item.list.subtitle')} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/addItem')}>
          {t('item.list.add')}
        </Button>
      </Box>

      <Box
        flex={1}
        minHeight={0}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          '& .MuiDataGrid-root': { border: 'none' },
          '& .MuiDataGrid-cell': { borderBottom: 'none' },
          '& .MuiDataGrid-columnHeaders': { backgroundColor: theme.palette.secondary[300], color: theme.palette.primary[600], borderBottom: 'none' },
          '& .MuiDataGrid-virtualScroller': { backgroundColor: theme.palette.background.paper },
          '& .MuiDataGrid-footerContainer': { backgroundColor: theme.palette.background.paper, color: theme.palette.secondary[100], borderTop: 'none' },
          '& .MuiDataGrid-toolbarContainer .MuiButton-text': { color: `${theme.palette.secondary[200]} !important` },
        }}
      >
        <DataGrid
          rows={items}
          columns={columns}
          getRowId={(row) => row.id ?? ''}
          density="comfortable"
          localeText={localeText}
          rowCount={total}
          loading={loading}
          page={page}
          pageSize={pageSize}
          paginationMode="server"
          sortingMode="server"
          rowsPerPageOptions={isMobile ? [10, 20] : [10, 20, 50]}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(0); }}
          onSortModelChange={(model) => {
            if (model.length > 0) {
              setSortModel([{ field: model[0].field, sort: model[0].sort ?? 'asc' }]);
            } else {
              setSortModel([]);
            }
          }}
          onRowClick={(params) => navigate(`/item/${params.row.id}`)}
          components={{ Toolbar: DataGridCustomToolbar }}
          componentsProps={{ toolbar: { setSearch } }}
          sx={{
            '& .MuiDataGrid-virtualScroller': { overflow: 'auto', scrollbarWidth: 'thin' },
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .MuiDataGrid-row.Mui-selected': { backgroundColor: `${theme.palette.action.selected} !important`, color: theme.palette.primary.contrastText },
            '& .MuiDataGrid-row.Mui-selected:hover': { backgroundColor: `${theme.palette.action.hover} !important` },
            '& .MuiDataGrid-columnHeaderTitle': { fontSize: isMobile ? '0.75rem' : '0.875rem' },
            '& .MuiDataGrid-cellContent': { fontSize: isMobile ? '0.75rem' : '0.875rem' },
          }}
        />
      </Box>

      <ConfirmDialog
        open={open}
        title={t('item.list.deleteTitle')}
        message={t('item.list.deleteDescription', { name: selected?.name })}
        onConfirm={handleDeleteConfirm}
        onClose={() => setOpen(false)}
      />

      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={notification?.type} onClose={() => setNotification(null)} sx={{ width: '100%' }}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ItemList;