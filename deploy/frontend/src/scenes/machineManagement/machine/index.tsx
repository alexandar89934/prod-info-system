import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  Snackbar,
  Alert,
  useMediaQuery,
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
import { fetchMachines, deleteMachine } from '@/state/machine/machine.actions';
import {
  selectMachines,
  selectMachineLoading,
  selectMachineError,
  selectMachineSuccess,
  selectMachineTotal,
} from '@/state/machine/machine.selectors';
import { clearError, clearSuccess, resetState } from '@/state/machine/machine.slice';
import { Machine } from '@/state/machine/machine.types';
import { AppDispatch } from '@/state/store';

import MachineCard, { MachineListItem } from './MachineCard';

const MachineList = () => {
  type SelectedItem = { id: string; name: string };

  const { t } = useTranslation();
  const localeText = useDataGridLocaleText();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch<AppDispatch>();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(isMobile ? 10 : 20);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortModel, setSortModel] = useState<{ field: string; sort: string }[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(
    () => (localStorage.getItem('machineViewMode') as 'table' | 'grid') ?? 'table'
  );

  const machines = useSelector(selectMachines);
  const loading = useSelector(selectMachineLoading);
  const error = useSelector(selectMachineError);
  const success = useSelector(selectMachineSuccess);
  const total = useSelector(selectMachineTotal);

  const sortField = sortModel[0]?.field ?? '';
  const sortOrder = sortModel[0]?.sort ?? '';

  useEffect(() => {
    dispatch(fetchMachines({ page: page + 1, limit: pageSize, search, sortField, sortOrder }));
  }, [dispatch, page, pageSize, search, sortField, sortOrder]);

  useEffect(() => {
    if (success) {
      setNotification({ message: success, type: 'success' });
      dispatch(clearSuccess());
      dispatch(fetchMachines({ page: page + 1, limit: pageSize, search, sortField, sortOrder }));
    }
    if (error) {
      setNotification({ message: error, type: 'error' });
      dispatch(clearError());
    }
  }, [success, error, dispatch, page, pageSize, search, sortField, sortOrder]);

  useEffect(() => () => { dispatch(resetState()); }, [dispatch]);

  const handleConfirmDelete = async () => {
    if (!selected) return;
    setOpen(false);
    dispatch(deleteMachine(selected.id));
  };

  const BooleanCell = ({ value }: { value: boolean }) =>
    value ? <CheckIcon color="success" fontSize="small" /> : <CloseIcon color="disabled" fontSize="small" />;

  const columns = [
    { field: 'name', headerName: t('machine.columns.name'), flex: 1 },
    { field: 'machineNumber', headerName: t('machine.columns.machineNumber'), flex: 1 },
    { field: 'serialNumber', headerName: t('machine.columns.serialNumber'), flex: 1 },
    { field: 'availabilityStatusName', headerName: t('machine.columns.availabilityStatus'), flex: 1 },
    {
      field: 'automaticMode',
      headerName: t('machine.columns.automaticMode'),
      width: 80,
      renderCell: (params: GridRenderCellParams<Machine>) => <BooleanCell value={!!params.value} />,
    },
    {
      field: 'workPermit',
      headerName: t('machine.columns.workPermit'),
      width: 110,
      renderCell: (params: GridRenderCellParams<Machine>) => <BooleanCell value={!!params.value} />,
    },
    {
      field: 'actions',
      headerName: t('machine.columns.actions'),
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Machine>) => (
        <Box>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); navigate(`/editMachine/${params.row.id}`); }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              setSelected({ id: String(params.row.id), name: params.row.name });
              setOpen(true);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleViewMode = (_: React.MouseEvent<HTMLElement>, next: 'table' | 'grid' | null) => {
    if (!next) return;
    setViewMode(next);
    localStorage.setItem('machineViewMode', next);
  };

  const handleDeleteCard = (id: string, name: string) => {
    setSelected({ id, name });
    setOpen(true);
  };

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
        <Header title={t('machine.title')} subtitle={t('machine.subtitle')} />
        <Box display="flex" alignItems="center" gap={1}>
          <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewMode} size="small">
            <ToggleButton value="table"><TableRowsIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="grid"><ViewModuleIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/addMachine')} fullWidth={isMobile} size={isMobile ? 'medium' : 'large'}>
            {t('machine.addButton')}
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
            rows={machines || []}
            getRowId={(row) => row.id}
            columns={columns}
            rowCount={total || 0}
            rowsPerPageOptions={isMobile ? [10, 20] : [10, 20, 50]}
            pagination
            page={page}
            pageSize={pageSize}
            paginationMode="server"
            sortingMode="server"
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSortModelChange={(model) => setSortModel(model.map((m) => ({ field: m.field, sort: m.sort ?? 'asc' })))}
            components={{ Toolbar: DataGridCustomToolbar }}
            componentsProps={{ toolbar: { searchInput, setSearchInput, setSearch } }}
            density="comfortable"
            localeText={localeText}
            onRowClick={(params) => navigate(`/machine/${params.row.id}`)}
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
      ) : (
        <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Grid container spacing={2}>
              {(machines as MachineListItem[]).map((machine) => (
                <Grid item key={machine.id} xs={12} sm={6} md={4} lg={3}>
                  <MachineCard machine={machine} onDelete={handleDeleteCard} />
                </Grid>
              ))}
            </Grid>
          </Box>
          {total > pageSize && (
            <Box
              display="flex"
              justifyContent="center"
              py={2}
              sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: 'divider' }}
            >
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
        title={t('machine.confirmDelete.title')}
        message={t('machine.confirmDelete.message', { name: selected?.name })}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setNotification(null)} severity={notification?.type ?? 'info'}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MachineList;