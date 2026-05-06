import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  Pagination,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
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
import { deletePackagingUnit, fetchPackagingUnits } from '@/state/packagingUnit/packagingUnit.actions';
import PackagingUnitCard from './PackagingUnitCard';
import {
  selectPackagingUnitError,
  selectPackagingUnitLoading,
  selectPackagingUnitSuccess,
  selectPackagingUnitTotal,
  selectPackagingUnits,
} from '@/state/packagingUnit/packagingUnit.selectors';
import { clearError, clearSuccess, resetState } from '@/state/packagingUnit/packagingUnit.slice';
import { PackagingUnit } from '@/state/packagingUnit/packagingUnit.types';
import { AppDispatch } from '@/state/store';

const PackagingUnitList = () => {
  type SelectedItem = { id: string; name: string };

  const { t } = useTranslation();
  const localeText = useDataGridLocaleText();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch<AppDispatch>();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(isMobile ? 10 : 50);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(
    () => (localStorage.getItem('packagingUnitViewMode') as 'table' | 'grid') ?? 'table'
  );
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const packagingUnits = useSelector(selectPackagingUnits);
  const loading = useSelector(selectPackagingUnitLoading);
  const error = useSelector(selectPackagingUnitError);
  const success = useSelector(selectPackagingUnitSuccess);
  const total = useSelector(selectPackagingUnitTotal);

  useEffect(() => {
    if (isMobile && pageSize === 50) setPageSize(10);
  }, [isMobile, pageSize]);

  useEffect(() => {
    dispatch(fetchPackagingUnits({ page: page + 1, limit: pageSize, search }));
  }, [dispatch, page, pageSize, search]);

  useEffect(() => {
    if (success) {
      setNotification({ message: success, type: 'success' });
      dispatch(clearSuccess());
      dispatch(fetchPackagingUnits({ page: page + 1, limit: pageSize, search }));
    }
    if (error) {
      setNotification({ message: error, type: 'error' });
      dispatch(clearError());
    }
  }, [success, error, dispatch, page, pageSize, search]);

  useEffect(() => () => { dispatch(resetState()); }, [dispatch]);

  const handleViewMode = (_: React.MouseEvent<HTMLElement>, next: 'table' | 'grid' | null) => {
    if (!next) return;
    setViewMode(next);
    localStorage.setItem('packagingUnitViewMode', next);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    setOpen(false);
    dispatch(deletePackagingUnit(selected.id));
  };

  const columns = [
    { field: 'name', headerName: t('packagingUnit.list.name'), flex: 1, minWidth: 180 },
    { field: 'description', headerName: t('packagingUnit.list.description'), flex: 2, minWidth: 200,
      renderCell: (params: GridRenderCellParams<PackagingUnit>) => params.row.description ?? '—',
    },
    {
      field: 'actions',
      headerName: t('packagingUnit.list.actions'),
      width: 110,
      sortable: false,
      renderCell: (params: GridRenderCellParams<PackagingUnit>) => (
        <Box>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/editPackagingUnit/${params.row.id}`); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => { e.stopPropagation(); setSelected({ id: params.row.id!, name: params.row.name }); setOpen(true); }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, pt: { xs: 1, sm: 2 }, pb: 1, display: 'flex', flexDirection: 'column', height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' } }}>
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent="space-between"
        alignItems={isMobile ? 'flex-start' : 'center'}
        mb={2}
        gap={isMobile ? 2 : 0}
      >
        <Header title={t('packagingUnit.list.title')} subtitle={t('packagingUnit.list.subtitle')} />
        <Box display="flex" alignItems="center" gap={1}>
          <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewMode} size="small">
            <ToggleButton value="table"><TableRowsIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="grid"><ViewModuleIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/addPackagingUnit')}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
          >
            {t('packagingUnit.list.add')}
          </Button>
        </Box>
      </Box>

      {viewMode === 'table' ? (
        <Box
          width="100%"
          sx={{
            flexGrow: 1,
            minHeight: 0,
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
            loading={loading}
            rows={packagingUnits}
            getRowId={(row) => row.id ?? ''}
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
      ) : (
        <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Grid container spacing={2}>
            {packagingUnits.map((unit) => (
              <Grid item key={unit.id} xs={12} sm={6} md={4} lg={3}>
                <PackagingUnitCard
                  packagingUnit={unit}
                  onDelete={(id, name) => { setSelected({ id, name }); setOpen(true); }}
                />
              </Grid>
            ))}
          </Grid>
          {total > pageSize && (
            <Box display="flex" justifyContent="center" pb={2}>
              <Pagination
                count={Math.ceil(total / pageSize)}
                page={page + 1}
                onChange={(_, value) => setPage(value - 1)}
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}

      <ConfirmDialog
        open={open}
        title={t('packagingUnit.list.deleteTitle')}
        message={t('packagingUnit.list.deleteDescription', { name: selected?.name })}
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

export default PackagingUnitList;