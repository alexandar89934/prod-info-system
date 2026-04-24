import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  IconButton,
  useTheme,
  Snackbar,
  Alert,
  useMediaQuery,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import ConfirmDialog from '@/reusableComponents/ConfirmDialog';
import DataGridCustomToolbar from '@/reusableComponents/DataGridCustomToolbar';
import Header from '@/reusableComponents/Header';
import { useDataGridLocaleText } from '@/reusableComponents/useDataGridLocaleText';
import { AppDispatch } from '@/state/store';
import {
  fetchJobPositionCategories,
  deleteJobPositionCategory,
} from '@/state/jobPositionCategory/jobPositionCategory.actions';
import {
  selectJobPositionCategories,
  selectJobPositionCategoryLoading,
  selectJobPositionCategoryError,
  selectJobPositionCategorySuccess,
  selectJobPositionCategoryTotal,
} from '@/state/jobPositionCategory/jobPositionCategory.selectors';
import {
  clearError,
  clearSuccess,
  resetState,
} from '@/state/jobPositionCategory/jobPositionCategory.slice';

const JobPositionCategoryList = () => {
  type SelectedItem = {
    id: string;
    name: string;
  };

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
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortModel, setSortModel] = useState([]);
  const [reload, setReload] = useState(false);

  const categories = useSelector(selectJobPositionCategories);
  const loading = useSelector(selectJobPositionCategoryLoading);
  const error = useSelector(selectJobPositionCategoryError);
  const success = useSelector(selectJobPositionCategorySuccess);
  const total = useSelector(selectJobPositionCategoryTotal);

  useEffect(() => {
    const sortField = sortModel[0]?.field || '';
    const sortOrder = sortModel[0]?.sort || '';
    dispatch(
      fetchJobPositionCategories({
        limit: pageSize,
        page: page + 1,
        search,
        sortField,
        sortOrder,
      })
    );
    return () => {
      dispatch(resetState());
    };
  }, [dispatch, page, pageSize, search, reload, sortModel]);

  useEffect(() => {
    if (success) {
      setNotification({ message: success, type: 'success' });
      setTimeout(() => dispatch(clearSuccess()), 3000);
    }
    if (error) {
      setNotification({ message: error, type: 'error' });
      setTimeout(() => dispatch(clearError()), 3000);
    }
  }, [success, error, dispatch]);

  const handleAdd = () => navigate('/addJobPositionCategory');
  const handleEdit = (row) => navigate(`/editJobPositionCategory/${row.id}`);
  const handleDelete = (row) => {
    setSelected(row);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };
  const handleConfirmDelete = async () => {
    if (selected) {
      await dispatch(deleteJobPositionCategory(selected.id));
      handleClose();
      setReload((prev) => !prev);
    }
  };

  const columns = [
    { field: 'id', headerName: t('jobPositionCategory.columns.id'), flex: 0.3 },
    { field: 'name', headerName: t('jobPositionCategory.columns.name'), flex: 1 },
    { field: 'description', headerName: t('jobPositionCategory.columns.description'), flex: 1.5 },
    {
      field: 'actions',
      headerName: t('jobPositionCategory.columns.actions'),
      flex: 0.8,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row)}>
            <DeleteIcon />
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
        <Header
          title={t('jobPositionCategory.title')}
          subtitle={t('jobPositionCategory.subtitle')}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          fullWidth={isMobile}
          size={isMobile ? 'medium' : 'large'}
        >
          {t('jobPositionCategory.addButton')}
        </Button>
      </Box>

      <Box
        width="100%"
        sx={{
          flexGrow: 1,
          minHeight: 0,
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
          rows={categories || []}
          getRowId={(row) => row.id}
          columns={columns}
          rowCount={total || 0}
          rowsPerPageOptions={isMobile ? [5, 10, 20] : [5, 10, 20, 50, 100]}
          pagination
          page={page}
          pageSize={pageSize}
          paginationMode="server"
          sortingMode="server"
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onSortModelChange={setSortModel}
          components={{ Toolbar: DataGridCustomToolbar }}
          componentsProps={{
            toolbar: { searchInput, setSearchInput, setSearch },
          }}
          density="comfortable"
          localeText={localeText}
          sx={{
            '& .MuiDataGrid-virtualScroller': {
              overflow: 'auto',
              scrollbarWidth: 'thin',
            },
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

      <ConfirmDialog
        open={open}
        title={t('jobPositionCategory.confirmDelete.title')}
        message={t('jobPositionCategory.confirmDelete.message', { name: selected?.name })}
        onClose={handleClose}
        onConfirm={handleConfirmDelete}
      />

      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity={notification?.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JobPositionCategoryList;