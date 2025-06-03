import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WorkIcon from '@mui/icons-material/Work';
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
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import ConfirmDialog from '@/reusableComponents/ConfirmDialog';
import DataGridCustomToolbar from '@/reusableComponents/DataGridCustomToolbar';
import Header from '@/reusableComponents/Header';
import { AppDispatch } from '@/state/store';
import {
  fetchWorkplaces,
  deleteWorkplace,
} from '@/state/workplace/workplace.actions';
import {
  selectWorkplaces,
  selectWorkplaceLoading,
  selectWorkplaceError,
  selectWorkplaceSuccess,
  selectWorkplaceTotal,
} from '@/state/workplace/workplace.selectors';
import {
  clearError,
  clearSuccess,
  resetState,
} from '@/state/workplace/workplace.slice';

const WorkplaceList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch<AppDispatch>();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(isMobile ? 10 : 20);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(
    null
  );
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortModel, setSortModel] = useState<any[]>([]);
  const [reload, setReload] = useState(false);

  const workplaces = useSelector(selectWorkplaces);
  const loading = useSelector(selectWorkplaceLoading);
  const error = useSelector(selectWorkplaceError);
  const success = useSelector(selectWorkplaceSuccess);
  const total = useSelector(selectWorkplaceTotal);

  useEffect(() => {
    const sortField = sortModel[0]?.field || '';
    const sortOrder = sortModel[0]?.sort || '';
    dispatch(
      fetchWorkplaces({
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

  const handleAdd = () => navigate('/addWorkplace');
  const handleManageCategories = () => navigate('/workplaceCategories');
  const handleEdit = (row: any) => navigate(`/editWorkplace/${row.id}`);
  const handleDelete = (row: any) => {
    setSelected(row);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };
  const handleConfirmDelete = async () => {
    if (selected) {
      await dispatch(deleteWorkplace(selected.id));
      handleClose();
      setReload((prev) => !prev);
    }
  };

  const mobileColumns = [
    { field: 'name', headerName: 'Workplace', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEdit(params.row)} size="small">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row)} size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const desktopColumns = [
    { field: 'id', headerName: 'ID', flex: 0.3 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1.5 },
    { field: 'categoryName', headerName: 'Category', flex: 0.6 },
    {
      field: 'actions',
      headerName: 'Actions',
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

  const columns = isMobile ? mobileColumns : desktopColumns;

  return (
    <Box m={isMobile ? '1rem' : '5rem'}>
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent="space-between"
        alignItems={isMobile ? 'flex-start' : 'center'}
        mb={2}
        gap={isMobile ? 2 : 0}
      >
        <Header title="WORKPLACES" subtitle="List of all workplaces" />
        <Box display="flex" flexDirection="row-reverse" gap={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
          >
            Add new workplace
          </Button>

          <Button
            variant="contained"
            startIcon={<WorkIcon />}
            onClick={handleManageCategories}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
          >
            Manage Workplace Categories
          </Button>
        </Box>
      </Box>

      <Box
        height={isMobile ? '70vh' : '78vh'}
        width="100%"
        sx={{
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
          density="comfortable"
          loading={loading}
          rows={workplaces || []}
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
        title="Confirm Delete"
        message={`Are you sure you want to delete "${selected?.name}"?`}
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

export default WorkplaceList;
