import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Pagination,
  Snackbar,
  TextField,
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

import MoldCard, { MoldListItem } from './MoldCard';

import ConfirmDialog from '@/reusableComponents/ConfirmDialog';
import DataGridCustomToolbar from '@/reusableComponents/DataGridCustomToolbar';
import Header from '@/reusableComponents/Header';
import { useDataGridLocaleText } from '@/reusableComponents/useDataGridLocaleText';
import { deleteMold, fetchMolds } from '@/state/mold/mold.actions';
import {
  selectMoldError,
  selectMoldLoading,
  selectMoldSuccess,
  selectMoldTotal,
  selectMolds,
} from '@/state/mold/mold.selectors';
import { clearError, clearSuccess, resetState } from '@/state/mold/mold.slice';
import { Mold } from '@/state/mold/mold.types';
import { AppDispatch } from '@/state/store';

const MoldList = () => {
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
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortModel, setSortModel] = useState<{ field: string; sort: string }[]>(
    []
  );
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(
    () => (localStorage.getItem('moldViewMode') as 'table' | 'grid') ?? 'table'
  );

  const molds = useSelector(selectMolds);
  const loading = useSelector(selectMoldLoading);
  const error = useSelector(selectMoldError);
  const success = useSelector(selectMoldSuccess);
  const total = useSelector(selectMoldTotal);

  const sortField = sortModel[0]?.field ?? '';
  const sortOrder = sortModel[0]?.sort ?? '';

  useEffect(() => {
    dispatch(
      fetchMolds({
        page: page + 1,
        limit: pageSize,
        search,
        sortField,
        sortOrder,
      })
    );
  }, [dispatch, page, pageSize, search, sortField, sortOrder]);

  useEffect(() => {
    if (success) {
      setNotification({ message: success, type: 'success' });
      dispatch(clearSuccess());
      dispatch(
        fetchMolds({
          page: page + 1,
          limit: pageSize,
          search,
          sortField,
          sortOrder,
        })
      );
    }
    if (error) {
      setNotification({ message: error, type: 'error' });
      dispatch(clearError());
    }
  }, [success, error, dispatch, page, pageSize, search, sortField, sortOrder]);

  useEffect(
    () => () => {
      dispatch(resetState());
    },
    [dispatch]
  );

  useEffect(() => {
    if (viewMode !== 'grid') return undefined;
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, viewMode, setSearch, setPage]);

  const handleConfirmDelete = async () => {
    if (!selected) return;
    setOpen(false);
    dispatch(deleteMold(selected.id));
  };

  const statusColor = (status: string) => {
    if (status === 'ok') return 'success';
    if (status === 'repair') return 'warning';
    return 'error';
  };

  const columns = [
    {
      field: 'inventoryNumber',
      headerName: t('mold.form.inventoryNumber'),
      width: 140,
    },
    { field: 'name', headerName: t('mold.form.name'), flex: 1, minWidth: 180 },
    {
      field: 'status',
      headerName: t('mold.form.status'),
      width: 120,
      renderCell: (params: GridRenderCellParams<Mold>) => (
        <Chip
          label={t(`mold.status.${params.row.status}`)}
          color={
            statusColor(params.row.status) as 'success' | 'warning' | 'error'
          }
          size="small"
        />
      ),
    },
    { field: 'cavities', headerName: t('mold.form.cavities'), width: 100 },
    {
      field: 'weight',
      headerName: `${t('mold.form.weight')} (kg)`,
      width: 110,
    },
    {
      field: 'serviceCategory',
      headerName: t('mold.form.serviceCategory'),
      width: 130,
    },
    {
      field: 'requiredClampingForceKN',
      headerName: `${t('mold.form.requiredClampingForceKN')} (kN)`,
      width: 160,
    },
    {
      field: 'pieceCounter',
      headerName: t('mold.form.pieceCounter'),
      width: 120,
    },
    {
      field: 'actions',
      headerName: t('mold.actions.label'),
      width: 110,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Mold>) => (
        <Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/editMold/${params.row.id}`);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              setSelected({ id: params.row.id!, name: params.row.name });
              setOpen(true);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const gridPageCount = Math.ceil(total / pageSize);

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
        <Header
          title={t('mold.list.title')}
          subtitle={t('mold.list.subtitle')}
        />
        <Box display="flex" alignItems="center" gap={1}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            size="small"
            onChange={(_, val) => {
              if (val) {
                setViewMode(val);
                setSearchInput('');
                setSearch('');
                setPage(0);
                localStorage.setItem('moldViewMode', val);
              }
            }}
          >
            <ToggleButton value="table">
              <TableRowsIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="grid">
              <ViewModuleIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/addMold')}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
          >
            {t('mold.actions.add')}
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
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: theme.palette.secondary[300],
              color: theme.palette.primary[600],
              borderBottom: 'none',
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: theme.palette.background.paper,
            },
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
            rows={molds}
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
            onSortModelChange={(model) =>
              setSortModel(
                model.map((s) => ({ field: s.field, sort: s.sort ?? 'asc' }))
              )
            }
            components={{ Toolbar: DataGridCustomToolbar }}
            componentsProps={{
              toolbar: { searchInput, setSearchInput, setSearch },
            }}
            density="comfortable"
            localeText={localeText}
            onRowClick={(params) => navigate(`/mold/${params.row.id}`)}
            sx={{
              '& .MuiDataGrid-virtualScroller': {
                overflow: 'auto',
                scrollbarWidth: 'thin',
              },
              '& .MuiDataGrid-row': { cursor: 'pointer' },
              '& .MuiDataGrid-row.Mui-selected': {
                backgroundColor: `${theme.palette.action.selected} !important`,
                color: theme.palette.primary.contrastText,
              },
              '& .MuiDataGrid-row.Mui-selected:hover': {
                backgroundColor: `${theme.palette.action.hover} !important`,
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontSize: isMobile ? '0.75rem' : '0.875rem',
              },
              '& .MuiDataGrid-cellContent': {
                fontSize: isMobile ? '0.75rem' : '0.875rem',
              },
            }}
          />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box pb={1}>
            <TextField
              size="small"
              label={t('common.search')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              variant="outlined"
              sx={{ width: 280 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      {searchInput && (
                        <IconButton
                          size="small"
                          onClick={() => setSearchInput('')}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      )}
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
          <Grid container spacing={2}>
            {molds.map((mold) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={mold.id}>
                <MoldCard
                  mold={mold as MoldListItem}
                  onDelete={(m) => {
                    setSelected({ id: m.id!, name: m.name });
                    setOpen(true);
                  }}
                />
              </Grid>
            ))}
          </Grid>
          {gridPageCount > 1 && (
            <Box
              display="flex"
              justifyContent="center"
              py={2}
              sx={{ borderTop: '1px solid', borderColor: 'divider' }}
            >
              <Pagination
                count={gridPageCount}
                page={page + 1}
                onChange={(_, val) => setPage(val - 1)}
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}

      <ConfirmDialog
        open={open}
        title={t('mold.actions.deleteConfirmTitle')}
        message={t('mold.actions.deleteConfirmMessage', {
          name: selected?.name,
        })}
        onConfirm={handleConfirmDelete}
        onClose={() => setOpen(false)}
      />

      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={notification?.type}
          onClose={() => setNotification(null)}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MoldList;
