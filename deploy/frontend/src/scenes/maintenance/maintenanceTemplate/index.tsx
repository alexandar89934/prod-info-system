import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
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
import {
  deleteMaintenanceTemplate,
  fetchMaintenanceTemplates,
} from '@/state/maintenanceTemplate/maintenanceTemplate.actions';
import {
  selectMaintenanceTemplateError,
  selectMaintenanceTemplateLoading,
  selectMaintenanceTemplateSuccess,
  selectMaintenanceTemplateTotal,
  selectMaintenanceTemplates,
} from '@/state/maintenanceTemplate/maintenanceTemplate.selectors';
import { clearError, clearSuccess, resetState } from '@/state/maintenanceTemplate/maintenanceTemplate.slice';
import { MaintenanceTemplate } from '@/state/maintenanceTemplate/maintenanceTemplate.types';
import { AppDispatch } from '@/state/store';

const MaintenanceTemplateList = () => {
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
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const items = useSelector(selectMaintenanceTemplates);
  const loading = useSelector(selectMaintenanceTemplateLoading);
  const error = useSelector(selectMaintenanceTemplateError);
  const success = useSelector(selectMaintenanceTemplateSuccess);
  const total = useSelector(selectMaintenanceTemplateTotal);

  useEffect(() => {
    if (isMobile && pageSize === 50) setPageSize(10);
  }, [isMobile, pageSize]);

  useEffect(() => {
    dispatch(fetchMaintenanceTemplates({ page: page + 1, limit: pageSize, search }));
  }, [dispatch, page, pageSize, search]);

  useEffect(() => {
    if (success) {
      setNotification({ message: success, type: 'success' });
      dispatch(clearSuccess());
      dispatch(fetchMaintenanceTemplates({ page: page + 1, limit: pageSize, search }));
    }
    if (error) {
      setNotification({ message: error, type: 'error' });
      dispatch(clearError());
    }
  }, [success, error, dispatch, page, pageSize, search]);

  useEffect(() => () => { dispatch(resetState()); }, [dispatch]);

  const handleConfirmDelete = () => {
    if (!selected) return;
    setOpen(false);
    dispatch(deleteMaintenanceTemplate(selected.id));
  };

  const columns = [
    {
      field: 'name',
      headerName: t('maintenanceTemplate.name'),
      flex: 2,
      minWidth: 180,
    },
    {
      field: 'targetType',
      headerName: t('maintenanceTemplate.targetType'),
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<MaintenanceTemplate>) =>
        t(`maintenanceTemplate.targetTypes.${params.row.targetType}`),
    },
    {
      field: 'intervalType',
      headerName: t('maintenanceTemplate.intervalType'),
      flex: 1,
      minWidth: 130,
      renderCell: (params: GridRenderCellParams<MaintenanceTemplate>) =>
        t(`maintenanceTemplate.intervalTypes.${params.row.intervalType}`),
    },
    {
      field: 'intervalValue',
      headerName: t('maintenanceTemplate.intervalValue'),
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<MaintenanceTemplate>) =>
        params.row.intervalValue != null ? String(params.row.intervalValue) : '—',
    },
    {
      field: 'stepCount',
      headerName: t('maintenanceTemplate.stepCount'),
      flex: 1,
      minWidth: 80,
      renderCell: (params: GridRenderCellParams<MaintenanceTemplate>) =>
        params.row.stepCount != null ? String(params.row.stepCount) : '0',
    },
    {
      field: 'actions',
      headerName: t('common.edit'),
      width: 110,
      sortable: false,
      renderCell: (params: GridRenderCellParams<MaintenanceTemplate>) => (
        <Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/maintenance-template/edit/${params.row.id}`);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              setSelected({ id: params.row.id, name: params.row.name });
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
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 3 },
        pt: { xs: 1, sm: 2 },
        pb: 1,
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
      }}
    >
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent="space-between"
        alignItems={isMobile ? 'flex-start' : 'center'}
        mb={2}
        gap={isMobile ? 2 : 0}
      >
        <Header title={t('maintenanceTemplate.title')} subtitle={t('maintenanceTemplate.title')} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/maintenance-template/add')}
          fullWidth={isMobile}
          size={isMobile ? 'medium' : 'large'}
        >
          {t('maintenanceTemplate.add')}
        </Button>
      </Box>

      <Box
        width="100%"
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflow: 'auto',
          '& .MuiDataGrid-root': { border: 'none' },
          '& .MuiDataGrid-cell': { borderBottom: 'none' },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.secondary[300],
            color: theme.palette.primary[600],
            borderBottom: 'none',
          },
          '& .MuiDataGrid-virtualScroller': { backgroundColor: theme.palette.background.paper },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.secondary[100],
            borderTop: 'none',
          },
          '& .MuiDataGrid-toolbarContainer .MuiButton-text': {
            color: `${theme.palette.secondary[200]} !important`,
          },
        }}
      >
        <DataGrid
          loading={loading}
          rows={items}
          getRowId={(row) => row.id}
          columns={columns}
          rowCount={total}
          rowsPerPageOptions={isMobile ? [10, 20] : [10, 20, 50]}
          pagination
          page={page}
          pageSize={pageSize}
          paginationMode="server"
          sortingMode="server"
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          components={{ Toolbar: DataGridCustomToolbar }}
          componentsProps={{ toolbar: { searchInput, setSearchInput, setSearch } }}
          density="comfortable"
          localeText={localeText}
          sx={{
            '& .MuiDataGrid-virtualScroller': { overflow: 'auto', scrollbarWidth: 'thin' },
            '& .MuiDataGrid-columnHeaderTitle': { fontSize: isMobile ? '0.75rem' : '0.875rem' },
            '& .MuiDataGrid-cellContent': { fontSize: isMobile ? '0.75rem' : '0.875rem' },
          }}
        />
      </Box>

      <ConfirmDialog
        open={open}
        title={t('maintenanceTemplate.title')}
        message={t('maintenanceTemplate.deleteConfirm')}
        onConfirm={handleConfirmDelete}
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

export default MaintenanceTemplateList;