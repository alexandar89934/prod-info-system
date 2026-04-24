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
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import profileImage from '../../assets/profile.jpeg';

import ConfirmDialog from '@/reusableComponents/ConfirmDialog.tsx';
import DataGridCustomToolbar from '@/reusableComponents/DataGridCustomToolbar.tsx';
import Header from '@/reusableComponents/Header.tsx';
import { useDataGridLocaleText } from '@/reusableComponents/useDataGridLocaleText';
import { getEmployeeNumber } from '@/state/auth/auth.selectors.ts';
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
import { PersonFormDataBase } from '@/state/person/person.types.ts';
import { AppDispatch } from '@/state/store.ts';

const Person = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const localeText = useDataGridLocaleText();
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
      headerName: t('person.columns.employee'),
      flex: 1,
      renderCell: (params: GridRenderCellParams<PersonFormDataBase>) => (
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
      headerName: t('person.columns.actions'),
      flex: 0.5,
      renderCell: (params: GridRenderCellParams<PersonFormDataBase>) => (
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
      headerName: t('person.columns.picture'),
      flex: 0.3,
      renderCell: (params: GridRenderCellParams<PersonFormDataBase>) => {
        return (
          <img
            src={(params.value as string) || profileImage}
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
    { field: 'employeeNumber', headerName: t('person.columns.employeeNumber'), flex: 0.5 },
    { field: 'name', headerName: t('person.columns.name'), flex: 1 },
    { field: 'mail', headerName: t('person.columns.email'), flex: 1.5 },
    {
      field: 'startDate',
      headerName: t('person.columns.startDate'),
      flex: 0.6,
      valueFormatter: ({ value }: { value: string }) =>
        value ? new Date(value).toLocaleDateString('en-GB') : '—',
    },
    {
      field: 'actions',
      headerName: t('person.columns.actions'),
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
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, pt: { xs: 1, sm: 2 }, pb: 1, display: 'flex', flexDirection: 'column', height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' } }}>
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent="space-between"
        alignItems={isMobile ? 'flex-start' : 'center'}
        mb={2}
        gap={isMobile ? 2 : 0}
      >
        <Header title={t('person.title')} subtitle={t('person.subtitle')} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPerson}
          fullWidth={isMobile}
          size={isMobile ? 'medium' : 'large'}
        >
          {t('person.addButton')}
        </Button>
      </Box>
      <Box
        width="100%"
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflow: 'auto',
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
        title={t('person.confirmDelete.title')}
        message={t('person.confirmDelete.message', { name: selectedPerson?.name })}
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
