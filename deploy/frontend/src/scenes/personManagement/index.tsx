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
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import profileImage from '../../assets/profile.jpeg';

import ConfirmDialog from '@/reusableComponents/ConfirmDialog.tsx';
import DataGridCustomToolbar from '@/reusableComponents/DataGridCustomToolbar.tsx';
import Header from '@/reusableComponents/Header.tsx';
import {
  getEmployeeNumber,
  getIsLoggedIn,
} from '@/state/auth/auth.selectors.ts';
import { deletePerson, fetchPersons } from '@/state/person/person.actions.ts';
import {
  selectError,
  selectLoading,
  selectPersons,
  selectSuccess,
  selectTotal,
} from '@/state/person/person.selectors.ts';
import {
  clearNotifications,
  clearPerson,
  clearPersons,
} from '@/state/person/person.slice.ts';
import { AppDispatch } from '@/state/store.ts';

const Person = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(isMobile ? 10 : 20);
  const [open, setOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [reload, setReload] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortModel, setSortModel] = useState([]);
  const persons = useSelector(selectPersons);
  const error = useSelector(selectError);
  const loading = useSelector(selectLoading);
  const success = useSelector(selectSuccess);
  const total = useSelector(selectTotal);
  const employeeNumber = getEmployeeNumber();
  const isLoggedIn = useSelector(getIsLoggedIn);

  const handleSortModelChange = (newModel) => {
    setSortModel(newModel);
  };

  const dispatch = useDispatch<AppDispatch>();

  const handleAddPerson = () => {
    navigate('/addPerson');
  };
  const handleEdit = (row: { id: string; employeeNumber: number }) => {
    if (Number(row.employeeNumber) === Number(employeeNumber)) {
      navigate(`/profilePage`);
      return;
    }
    navigate(`/editPerson/${row.id}`);
  };

  const handleDelete = (person) => {
    setSelectedPerson(person);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPerson(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedPerson) {
      await dispatch(deletePerson(selectedPerson.id));
      handleClose();
      setReload((prev) => !prev);
    }
  };

  useEffect(() => {
    const sortField = sortModel[0]?.field || '';
    const sortOrder = sortModel[0]?.sort || '';
    dispatch(
      fetchPersons({
        limit: pageSize,
        page: page + 1,
        search,
        sortField,
        sortOrder,
      })
    );
    return () => {
      dispatch(clearPersons());
    };
  }, [dispatch, page, pageSize, search, reload, sortModel]);

  useEffect(() => {
    if (!isLoggedIn) {
      setNotification({
        message: `Error Fetching Persons! ${error ?? (error || '')}`,
        type: 'error',
      });
    }
  }, [error, isLoggedIn, navigate]);

  useEffect(() => {
    if (success) {
      setNotification({ message: String(success), type: 'success' });
      setTimeout(() => {
        dispatch(clearPerson());
        dispatch(clearNotifications());
      }, 3000);
    }

    if (error) {
      setNotification({ message: error, type: 'error' });
      setTimeout(() => {
        dispatch(clearPerson());
        dispatch(clearNotifications());
      }, 3000);
    }
  }, [success, error, dispatch]);

  const mobileColumns = [
    {
      field: 'name',
      headerName: 'Employee',
      flex: 1,
      renderCell: (params: any) => (
        <Box display="flex" alignItems="center">
          <img
            src={params.row.picture || profileImage}
            alt="Person"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              objectFit: 'cover',
              marginRight: 10,
            }}
          />
          <Box>
            <div style={{ fontWeight: 'bold' }}>{params.value}</div>
            <div style={{ fontSize: '0.8rem' }}>
              #{params.row.employeeNumber}
            </div>
          </Box>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      renderCell: (params: { row: any }) => (
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
    {
      field: 'picture',
      headerName: 'Picture',
      flex: 0.3,
      renderCell: (params: any) => {
        return (
          <img
            src={params.value || profileImage}
            alt="Person"
            style={{
              width: 50,
              height: 50,
              borderRadius: '8%',
              objectFit: 'cover',
            }}
          />
        );
      },
    },
    { field: 'employeeNumber', headerName: 'Employee #', flex: 0.5 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'mail', headerName: 'Email', flex: 1.5 },
    {
      field: 'startDate',
      headerName: 'Start Date',
      flex: 0.6,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      renderCell: (params: { row: { id: string; employeeNumber: number } }) => (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'flex-start',
            width: '100%',
          }}
        >
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
    <Box m={isMobile ? '1rem' : '5rem 5rem'}>
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent="space-between"
        alignItems={isMobile ? 'flex-start' : 'center'}
        mb={2}
        gap={isMobile ? 2 : 0}
      >
        <Header title="EMPLOYEES" subtitle="List of all employees" />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPerson}
          fullWidth={isMobile}
          size={isMobile ? 'medium' : 'large'}
        >
          Add new person
        </Button>
      </Box>
      <Box
        height={isMobile ? '70vh' : '78vh'}
        width="100%"
        overflow="auto"
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
          },
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
          getRowId={(row) => row.id}
          rows={persons ?? []}
          columns={columns}
          rowCount={total ?? 0}
          rowsPerPageOptions={isMobile ? [5, 10, 20] : [5, 10, 20, 50, 100]}
          pagination
          page={page}
          pageSize={pageSize}
          paginationMode="server"
          sortingMode="server"
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          onSortModelChange={handleSortModelChange}
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
        message={`Are you sure you want to delete ${selectedPerson?.name}?`}
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

export default Person;
