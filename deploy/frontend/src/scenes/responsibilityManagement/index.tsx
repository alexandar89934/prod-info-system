import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Snackbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Button from '@mui/material/Button';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import ConfirmDialog from '@/reusableComponents/ConfirmDialog';
import DataGridCustomToolbar from '@/reusableComponents/DataGridCustomToolbar';
import Header from '@/reusableComponents/Header';
import { useDataGridLocaleText } from '@/reusableComponents/useDataGridLocaleText';
import { useAppDispatch } from '@/state/hooks';
import {
  deleteResponsibility,
  fetchResponsibilities,
} from '@/state/responsibility/responsibility.actions';
import {
  selectResponsibilities,
  selectResponsibilityError,
  selectResponsibilityLoading,
  selectResponsibilitySuccess,
} from '@/state/responsibility/responsibility.selectors';
import {
  clearError,
  clearSuccess,
  resetState,
} from '@/state/responsibility/responsibility.slice';
import { Responsibility } from '@/state/responsibility/responsibility.types';

const ResponsibilityList = () => {
  const { t } = useTranslation();
  const localeText = useDataGridLocaleText();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Responsibility | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const responsibilities = useSelector(selectResponsibilities);
  const loading = useSelector(selectResponsibilityLoading);
  const error = useSelector(selectResponsibilityError);
  const success = useSelector(selectResponsibilitySuccess);

  useEffect(() => {
    dispatch(fetchResponsibilities());
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

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

  const handleAdd = () => navigate('/addResponsibility');
  const handleEdit = (row: Responsibility) => navigate(`/editResponsibility/${row.id}`);
  const handleDelete = (row: Responsibility) => {
    setSelected(row);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };
  const handleConfirmDelete = async () => {
    if (selected) {
      await dispatch(deleteResponsibility(selected.id));
      handleClose();
      dispatch(fetchResponsibilities());
    }
  };

  const filtered = responsibilities.filter(
    (r) =>
      !search ||
      r.label.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: t('responsibility.columns.id'), flex: 0.3 },
    { field: 'code', headerName: t('responsibility.columns.code'), flex: 1 },
    { field: 'label', headerName: t('responsibility.columns.label'), flex: 1.2 },
    {
      field: 'description',
      headerName: t('responsibility.columns.description'),
      flex: 1.5,
      hide: isMobile,
    },
    {
      field: 'isSystem',
      headerName: t('responsibility.columns.type'),
      flex: 0.5,
      renderCell: (params: GridRenderCellParams<Responsibility>) =>
        params.row.isSystem ? (
          <Chip
            icon={<LockOutlinedIcon fontSize="small" />}
            label={t('responsibility.systemBadge')}
            size="small"
            color="default"
            variant="outlined"
          />
        ) : null,
    },
    {
      field: 'actions',
      headerName: t('responsibility.columns.actions'),
      flex: 0.6,
      renderCell: (params: GridRenderCellParams<Responsibility>) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => handleEdit(params.row)}
            disabled={params.row.isSystem}
            size="small"
          >
            <EditIcon fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row)}
            disabled={params.row.isSystem}
            size="small"
          >
            <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const dataGridSx = {
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
  };

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
          title={t('responsibility.title')}
          subtitle={t('responsibility.subtitle')}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          fullWidth={isMobile}
          size={isMobile ? 'medium' : 'large'}
        >
          {t('responsibility.addButton')}
        </Button>
      </Box>

      <Box width="100%" sx={{ flexGrow: 1, minHeight: 0, ...dataGridSx }}>
        <DataGrid
          loading={loading}
          rows={filtered}
          getRowId={(row) => row.id}
          columns={columns}
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
        title={t('responsibility.confirmDelete.title')}
        message={t('responsibility.confirmDelete.message', {
          label: selected?.label,
        })}
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

export default ResponsibilityList;