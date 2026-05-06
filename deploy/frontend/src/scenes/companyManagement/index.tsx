import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
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
import { deleteCompany, fetchCompanies } from '@/state/company/company.actions';
import {
  selectCompanies,
  selectCompanyError,
  selectCompanyLoading,
  selectCompanySuccess,
  selectCompanyTotal,
} from '@/state/company/company.selectors';
import { clearError, clearSuccess, resetState } from '@/state/company/company.slice';
import { Company } from '@/state/company/company.types';
import { AppDispatch } from '@/state/store';

type TypeFilter = 'all' | 'own' | 'customer' | 'supplier';

const CompanyList = () => {
  type SelectedItem = { id: string; name: string };

  const { t } = useTranslation();
  const localeText = useDataGridLocaleText();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch<AppDispatch>();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(isMobile ? 10 : 50);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const companies = useSelector(selectCompanies);
  const loading = useSelector(selectCompanyLoading);
  const error = useSelector(selectCompanyError);
  const success = useSelector(selectCompanySuccess);
  const total = useSelector(selectCompanyTotal);

  useEffect(() => {
    if (isMobile && pageSize === 50) setPageSize(10);
  }, [isMobile, pageSize]);

  useEffect(() => {
    dispatch(fetchCompanies({ page: page + 1, limit: pageSize, search }));
  }, [dispatch, page, pageSize, search]);

  useEffect(() => {
    if (success) {
      setNotification({ message: success, type: 'success' });
      dispatch(clearSuccess());
      dispatch(fetchCompanies({ page: page + 1, limit: pageSize, search }));
    }
    if (error) {
      setNotification({ message: error, type: 'error' });
      dispatch(clearError());
    }
  }, [success, error, dispatch, page, pageSize, search]);

  useEffect(() => () => { dispatch(resetState()); }, [dispatch]);

  const handleConfirmDelete = async () => {
    if (!selected) return;
    setOpen(false);
    dispatch(deleteCompany(selected.id));
  };

  const filteredCompanies = companies.filter((c) => {
    if (typeFilter === 'own') return c.isOwnCompany;
    if (typeFilter === 'customer') return c.isCustomer;
    if (typeFilter === 'supplier') return c.isSupplier;
    return true;
  });

  const renderTypeBadges = (row: Company) => (
    <Box display="flex" gap={0.5} flexWrap="wrap">
      {row.isOwnCompany && <Chip label={t('company.badge.own')} size="small" color="primary" />}
      {row.isCustomer && <Chip label={t('company.badge.customer')} size="small" color="success" />}
      {row.isSupplier && <Chip label={t('company.badge.supplier')} size="small" color="warning" />}
    </Box>
  );

  const columns = [
    {
      field: 'logo',
      headerName: '',
      width: 52,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Company>) => (
        <Box display="flex" alignItems="center" justifyContent="center" width="100%" height="100%">
          {params.row.logo ? (
            <Box
              component="img"
              src={`${import.meta.env.VITE_API_URL ?? ''}${params.row.logo}`}
              alt={params.row.name}
              sx={{ width: 32, height: 32, borderRadius: 1, objectFit: 'contain' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <BusinessIcon sx={{ fontSize: 24, color: 'text.disabled' }} />
          )}
        </Box>
      ),
    },
    { field: 'name', headerName: t('company.list.name'), flex: 2, minWidth: 200 },
    { field: 'pib', headerName: t('company.list.pib'), width: 115 },
    { field: 'mb', headerName: t('company.list.mb'), width: 110 },
    {
      field: 'phone',
      headerName: t('company.form.phones'),
      width: 140,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Company>) =>
        Array.isArray(params.row.phones) && params.row.phones.length > 0 ? params.row.phones[0] : '—',
    },
    {
      field: 'email',
      headerName: t('company.form.emails'),
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Company>) => {
        const emails = params.row.emails ?? [];
        const primary = emails.find((e) => e.isPrimary) ?? emails[0];
        return primary ? primary.address : '—';
      },
    },
    {
      field: 'type',
      headerName: t('company.list.type'),
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Company>) => renderTypeBadges(params.row),
    },
    {
      field: 'actions',
      headerName: t('company.list.actions'),
      width: 110,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Company>) => (
        <Box>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/editCompany/${params.row.id}`); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => { e.stopPropagation(); setSelected({ id: params.row.id, name: params.row.name }); setOpen(true); }}
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
        <Header title={t('company.list.title')} subtitle={t('company.list.subtitle')} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/addCompany')}
          fullWidth={isMobile}
          size={isMobile ? 'medium' : 'large'}
        >
          {t('company.list.add')}
        </Button>
      </Box>

      <Box mb={1.5}>
        <ToggleButtonGroup
          value={typeFilter}
          exclusive
          onChange={(_, val) => { if (val) { setTypeFilter(val); setPage(0); } }}
          size="small"
        >
          <ToggleButton value="all"><BusinessIcon fontSize="small" sx={{ mr: 0.5 }} />{t('company.list.filterAll')}</ToggleButton>
          <ToggleButton value="own">{t('company.list.filterOwn')}</ToggleButton>
          <ToggleButton value="customer">{t('company.list.filterCustomer')}</ToggleButton>
          <ToggleButton value="supplier">{t('company.list.filterSupplier')}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

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
          rows={filteredCompanies}
          getRowId={(row) => row.id}
          columns={columns}
          onRowClick={(params) => navigate(`/company/${params.row.id}`)}
          sx={{
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .MuiDataGrid-virtualScroller': { overflow: 'auto', scrollbarWidth: 'thin' },
            '& .MuiDataGrid-columnHeaderTitle': { fontSize: isMobile ? '0.75rem' : '0.875rem' },
            '& .MuiDataGrid-cellContent': { fontSize: isMobile ? '0.75rem' : '0.875rem' },
          }}
          rowCount={typeFilter === 'all' ? total : filteredCompanies.length}
          rowsPerPageOptions={isMobile ? [10, 20] : [10, 20, 50]}
          pagination
          page={page}
          pageSize={pageSize}
          paginationMode={typeFilter === 'all' ? 'server' : 'client'}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          components={{ Toolbar: DataGridCustomToolbar }}
          componentsProps={{ toolbar: { searchInput, setSearchInput, setSearch } }}
          density="comfortable"
          localeText={localeText}
        />
      </Box>

      <ConfirmDialog
        open={open}
        title={t('company.list.deleteTitle')}
        message={t('company.list.deleteDescription', { name: selected?.name })}
        onConfirm={handleConfirmDelete}
        onClose={() => setOpen(false)}
      />

      <Snackbar open={!!notification} autoHideDuration={4000} onClose={() => setNotification(null)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={notification?.type} onClose={() => setNotification(null)} sx={{ width: '100%' }}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyList;