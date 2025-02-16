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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import DataGridCustomToolbar from '../../components/DataGridCustomToolbar.tsx';
import Header from '../../components/Header.tsx';

import ConfirmDialog from '@/components/ConfirmDialog.tsx';
import { deletePerson, fetchPersons } from '@/state/person/person.actions.ts';
import { GetPersonsData } from '@/state/person/person.types.ts';
import { AppDispatch } from '@/state/store.ts';

const Person = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [persons, setPersons] = useState<GetPersonsData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
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

  const handleSortModelChange = (newModel) => {
    setSortModel(newModel);
  };

  const dispatch = useDispatch<AppDispatch>();

  const handleAddPerson = () => {
    navigate('/addPerson');
  };
  const handleEdit = (row: { id: string }) => {
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
      try {
        const result = await dispatch(deletePerson(selectedPerson.id));
        handleClose();

        if (deletePerson.rejected.match(result)) {
          const errorMessage = result.payload || 'Error deleting person!';
          setNotification({ message: `${errorMessage}`, type: 'error' });
          return;
        }
        setReload((prev) => !prev);
        setNotification({
          message: 'Person deleted successfully!',
          type: 'success',
        });
      } catch (error) {
        setNotification({ message: 'Error deleting person!', type: 'error' });
      }
    }
    handleClose();
  };

  useEffect(() => {
    const fetchPerson = async () => {
      setLoading(true);
      try {
        const result = await dispatch(
          fetchPersons({
            limit: pageSize,
            page: page + 1,
            search,
            sortField: sortModel.length ? sortModel[0].field : '',
            sortOrder: sortModel.length ? sortModel[0].sort : '',
          })
        );
        setPersons(result.payload.content.persons);
        setTotal(result.payload.content.pagination.total);
      } catch (error) {
        setNotification({ message: 'Error Fetching Persons!', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchPerson().then((r) => {
      return r;
    });
  }, [dispatch, page, pageSize, search, reload, sortModel]);

  const columns = [
    {
      field: 'picture',
      headerName: 'Picture',
      flex: 0.5,
      renderCell: (params) => (
        <img
          src={params.value}
          alt="Person"
          style={{ width: 50, height: 50, borderRadius: '8%' }}
        />
      ),
    },
    { field: 'employeeNumber', headerName: 'Employee #', flex: 1 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 1 },
    { field: 'mail', headerName: 'Email', flex: 1 },
    { field: 'additionalInfo', headerName: 'Additional Info', flex: 1 },
    {
      field: 'createdAt',
      headerName: 'Created At',
      flex: 1,
      valueFormatter: (params: { value: string }) =>
        new Date(params.value as string).toLocaleDateString(),
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
      flex: 1,
      valueFormatter: (params: { value: string }) =>
        new Date(params.value as string).toLocaleDateString(),
    },
    {
      field: 'edit',
      headerName: 'Edit',
      flex: 0.5,
      renderCell: (params: { row: { id: string } }) => (
        <IconButton onClick={() => handleEdit(params.row)}>
          <EditIcon />
        </IconButton>
      ),
    },
    {
      field: 'delete',
      headerName: 'Delete',
      flex: 0.5,
      renderCell: (params: { row: any }) => (
        <IconButton onClick={() => handleDelete(params.row)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box m="5rem 5rem">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Header title="PERSONS" subtitle="List of all persons" />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPerson}
          sx={{ marginLeft: 'auto' }}
        >
          Add new person
        </Button>
      </Box>
      <Box
        height="78vh"
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
          rows={(persons && persons) || []}
          columns={columns}
          rowCount={(total && total) || 0}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
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
              backgroundColor: `${theme.palette.action.selected} !important`, // Use MUI theme for selection
              color: theme.palette.primary.contrastText,
            },
            '& .MuiDataGrid-row.Mui-selected:hover': {
              backgroundColor: `${theme.palette.action.hover} !important`, // Hover effect
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
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Person;
