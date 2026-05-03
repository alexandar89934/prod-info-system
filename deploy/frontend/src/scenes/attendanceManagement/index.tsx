import AddIcon from '@mui/icons-material/Add';
import { EditOutlined, InfoOutlined } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Snackbar,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ManualAttendanceDialog from './ManualAttendanceDialog.tsx';
import OvertimeApproval from './OvertimeApproval.tsx';

import DataGridCustomToolbar from '@/reusableComponents/DataGridCustomToolbar';
import Header from '@/reusableComponents/Header';
import { useDataGridLocaleText } from '@/reusableComponents/useDataGridLocaleText';
import {
  fetchAttendances,
  fetchBreaksByAttendanceId,
  fetchMonthlySummary,
} from '@/state/attendance/attendance.actions.ts';
import { fetchPersons } from '@/state/person/person.actions.ts';
import { selectPersons } from '@/state/person/person.selectors.ts';
import { PersonFormDataBase } from '@/state/person/person.types.ts';
import {
  selectAttendanceError,
  selectAttendanceLoading,
  selectAttendances,
  selectAttendanceSuccess,
  selectAttendanceTotal,
  selectBreaks,
  selectBreaksLoading,
  selectMonthlySummary,
} from '@/state/attendance/attendance.selectors.ts';
import {
  clearError,
  clearSuccess,
  resetState,
} from '@/state/attendance/attendance.slice.ts';
import { Attendance } from '@/state/attendance/attendance.types.ts';
import { AppDispatch } from '@/state/store.ts';

const toDateString = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatDate = (raw: string) => {
  const parts = raw.slice(0, 10).split('-');
  if (parts.length !== 3) return raw;
  return `${parts[2]}.${parts[1]}.${parts[0]}.`;
};

const AttendanceManagement = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const localeText = useDataGridLocaleText();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch<AppDispatch>();

  const nowRef = useRef(new Date());
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(isMobile ? 10 : 20);
  const [, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortModel, setSortModel] = useState<{ field: string; sort: string }[]>(
    []
  );
  const [selectedPerson, setSelectedPerson] = useState<PersonFormDataBase | null>(null);
  const [personId, setPersonId] = useState('');
  const [dateFrom, setDateFrom] = useState(
    toDateString(
      new Date(nowRef.current.getFullYear(), nowRef.current.getMonth(), 1)
    )
  );
  const [dateTo, setDateTo] = useState(toDateString(nowRef.current));
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [breaksDialogOpen, setBreaksDialogOpen] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Attendance | null>(null);

  const persons = useSelector(selectPersons);

  const attendances = useSelector(selectAttendances);
  const total = useSelector(selectAttendanceTotal);
  const loading = useSelector(selectAttendanceLoading);
  const error = useSelector(selectAttendanceError);
  const success = useSelector(selectAttendanceSuccess);
  const monthlySummary = useSelector(selectMonthlySummary);
  const breaks = useSelector(selectBreaks);
  const breaksLoading = useSelector(selectBreaksLoading);

  const dialogFetchParams = {
    limit: pageSize,
    page: page + 1,
    personId: personId || undefined,
    dateFrom,
    dateTo,
    sortField: sortModel[0]?.field || 'date',
    sortOrder: sortModel[0]?.sort || 'DESC',
  };

  useEffect(() => {
    dispatch(fetchPersons({ page: 1, limit: 1000, search: '' }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchAttendances({
        limit: pageSize,
        page: page + 1,
        personId: personId || undefined,
        dateFrom,
        dateTo,
        sortField: sortModel[0]?.field || 'date',
        sortOrder: sortModel[0]?.sort || 'DESC',
      })
    );
    return () => {
      dispatch(resetState());
    };
  }, [dispatch, page, pageSize, personId, dateFrom, dateTo, sortModel]);

  useEffect(() => {
    if (personId) {
      dispatch(
        fetchMonthlySummary({
          personId,
          year: nowRef.current.getFullYear(),
          month: nowRef.current.getMonth() + 1,
        })
      );
    }
  }, [dispatch, personId]);

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

  const formatMinutes = (mins: number | null) => {
    if (mins == null) return '-';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return t('attendance.breaksDialog.noEnd');
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openBreaksDialog = (attendance: Attendance) => {
    dispatch(fetchBreaksByAttendanceId(attendance.id));
    setBreaksDialogOpen(true);
  };

  const openEditDialog = (row: Attendance) => {
    setEditTarget(row);
    setManualDialogOpen(true);
  };

  const renderFlags = (row: Attendance) => (
    <Box display="flex" flexWrap="wrap" gap={0.5}>
      {row.systemClosed && (
        <Chip
          label={t('attendance.flags.autoClosed')}
          color="warning"
          size="small"
        />
      )}
      {row.isManualEntry && (
        <Chip label={t('attendance.flags.manual')} color="info" size="small" />
      )}
      {!row.isManualEntry && row.editedBy && (
        <Chip label={t('attendance.flags.edited')} size="small" />
      )}
      {row.overtimeStatus === 'pending' && (
        <Chip
          label={t('attendance.flags.overtimePending')}
          color="warning"
          size="small"
        />
      )}
      {row.overtimeStatus === 'approved' && (
        <Chip
          label={t('attendance.flags.overtimeApproved')}
          color="success"
          size="small"
        />
      )}
      {row.overtimeStatus === 'rejected' && (
        <Chip
          label={t('attendance.flags.overtimeRejected')}
          color="error"
          size="small"
        />
      )}
    </Box>
  );

  const columns: GridColDef[] = [
    {
      field: 'personName',
      headerName: t('attendance.columns.person'),
      flex: 1,
    },
    {
      field: 'date',
      headerName: t('attendance.columns.date'),
      flex: 0.8,
      renderCell: (params: GridRenderCellParams<string, Attendance>) =>
        params.value ? formatDate(params.value) : '-',
    },
    {
      field: 'checkIn',
      headerName: t('attendance.columns.checkIn'),
      flex: 0.8,
      renderCell: (params: GridRenderCellParams<string, Attendance>) =>
        params.value
          ? new Date(params.value).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-',
    },
    {
      field: 'checkOut',
      headerName: t('attendance.columns.checkOut'),
      flex: 0.8,
      renderCell: (params: GridRenderCellParams<string, Attendance>) =>
        params.value
          ? new Date(params.value).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-',
    },
    {
      field: 'clockSpan',
      headerName: t('attendance.columns.clockSpan'),
      flex: 0.7,
      sortable: false,
      renderCell: (params: GridRenderCellParams<unknown, Attendance>) => {
        const { row } = params;
        if (!row.checkIn || !row.checkOut) return '-';
        const rawMinutes = Math.floor(
          (new Date(row.checkOut).getTime() - new Date(row.checkIn).getTime()) /
            60000
        );
        return formatMinutes(rawMinutes);
      },
    },
    {
      field: 'workMinutes',
      headerName: t('attendance.columns.totalHours'),
      flex: 0.8,
      renderCell: (params: GridRenderCellParams<number | null, Attendance>) =>
        formatMinutes(params.value ?? null),
    },
    {
      field: 'overtimeMinutes',
      headerName: t('attendance.columns.overtime'),
      flex: 0.7,
      renderCell: (params: GridRenderCellParams<number | null, Attendance>) =>
        formatMinutes(params.value ?? null),
    },
    {
      field: 'nightMinutes',
      headerName: t('attendance.columns.night'),
      flex: 0.7,
      renderCell: (params: GridRenderCellParams<number | null, Attendance>) =>
        formatMinutes(params.value ?? null),
    },
    {
      field: 'shiftType',
      headerName: t('attendance.columns.shift'),
      flex: 0.6,
      renderCell: (params: GridRenderCellParams<string | null, Attendance>) =>
        params.value ? t(`attendance.shiftTypes.${params.value}`) : '-',
    },
    {
      field: 'totalBreakMinutes',
      headerName: t('attendance.columns.breaks'),
      flex: 0.7,
      sortable: false,
      renderCell: (params: GridRenderCellParams<number | null, Attendance>) => {
        const { row } = params;
        const breakCount = row.breakCount ?? 0;
        const totalBreakMinutes = row.totalBreakMinutes ?? 0;
        if (breakCount === 0) return '-';
        const label = formatMinutes(totalBreakMinutes);
        if (breakCount > 1) {
          return (
            <Box display="flex" alignItems="center" gap={0.5}>
              <span>{label}</span>
              <Tooltip
                title={`${breakCount} ${t('attendance.breaksDialog.title').toLowerCase()}`}
              >
                <IconButton size="small" onClick={() => openBreaksDialog(row)}>
                  <InfoOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }
        return label;
      },
    },
    {
      field: 'flags',
      headerName: t('attendance.columns.status'),
      flex: 1.2,
      sortable: false,
      renderCell: (params: GridRenderCellParams<unknown, Attendance>) =>
        renderFlags(params.row),
    },
    {
      field: 'actions',
      headerName: '',
      flex: 0.4,
      sortable: false,
      renderCell: (params: GridRenderCellParams<unknown, Attendance>) => (
        <Tooltip title={t('attendance.manualEntry.editTitle')}>
          <IconButton size="small" onClick={() => openEditDialog(params.row)}>
            <EditOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
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
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Header
          title={t('attendance.title')}
          subtitle={t('attendance.subtitle')}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditTarget(null);
            setManualDialogOpen(true);
          }}
          fullWidth={isMobile}
          size={isMobile ? 'medium' : 'large'}
        >
          {t('attendance.manualEntry.addButton')}
        </Button>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v: number) => setTab(v)}
        sx={{
          mb: 2,
          minHeight: 40,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 1,
          p: 0.5,
          '& .MuiTab-root': {
            color: theme.palette.text.secondary,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.95rem',
            px: 3,
            minHeight: 36,
            borderRadius: 1,
            transition: 'background-color 0.2s, color 0.2s',
          },
          '& .Mui-selected': {
            color: theme.palette.common.white,
            backgroundColor: theme.palette.secondary.main,
          },
          '& .MuiTabs-indicator': {
            display: 'none',
          },
        }}
      >
        <Tab label={t('attendance.title')} />
        <Tab label={t('attendance.overtime.tabLabel')} />
      </Tabs>

      {tab === 0 && (
        <>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label={t('attendance.filters.dateFrom')}
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label={t('attendance.filters.dateTo')}
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={persons}
                getOptionLabel={(p) => `${p.name} (${p.employeeNumber})`}
                value={selectedPerson}
                onChange={(_, value) => {
                  setSelectedPerson(value);
                  setPersonId(value?.id ?? '');
                }}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('attendance.filters.person')}
                    fullWidth
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
          </Grid>

          {monthlySummary && (
            <Grid container spacing={2} mb={2}>
              {[
                {
                  label: t('attendance.summary.workingDays'),
                  value: monthlySummary.totalWorkingDays,
                },
                {
                  label: t('attendance.summary.totalHours'),
                  value: formatMinutes(monthlySummary.totalWorkMinutes),
                },
                {
                  label: t('attendance.summary.overtime'),
                  value: formatMinutes(monthlySummary.totalOvertimeMinutes),
                },
                {
                  label: t('attendance.summary.vacationUsed'),
                  value: monthlySummary.vacationDaysUsed,
                },
                {
                  label: t('attendance.summary.vacationRemaining'),
                  value: monthlySummary.vacationDaysRemaining,
                },
              ].map((item) => (
                <Grid item xs={6} sm={4} md={2} key={item.label}>
                  <Card
                    variant="outlined"
                    sx={{
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.secondary[300],
                    }}
                  >
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        {item.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box width="100%" sx={{ flexGrow: 1, minHeight: 0, ...dataGridSx }}>
            <DataGrid
              loading={loading}
              rows={attendances}
              getRowId={(row) => row.id}
              columns={columns}
              rowCount={total}
              rowsPerPageOptions={isMobile ? [5, 10, 20] : [5, 10, 20, 50, 100]}
              pagination
              page={page}
              pageSize={pageSize}
              paginationMode="server"
              sortingMode="server"
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              onSortModelChange={(model) =>
                setSortModel(model as { field: string; sort: string }[])
              }
              components={{ Toolbar: DataGridCustomToolbar }}
              componentsProps={{
                toolbar: { searchInput, setSearchInput, setSearch },
              }}
              density="comfortable"
              localeText={localeText}
            />
          </Box>
        </>
      )}

      {tab === 1 && <OvertimeApproval />}

      <Dialog
        open={breaksDialogOpen}
        onClose={() => setBreaksDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('attendance.breaksDialog.title')}</DialogTitle>
        <DialogContent>
          {breaksLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('attendance.breaksDialog.start')}</TableCell>
                  <TableCell>{t('attendance.breaksDialog.end')}</TableCell>
                  <TableCell>{t('attendance.breaksDialog.duration')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {breaks.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{formatTime(b.breakStart)}</TableCell>
                    <TableCell>{formatTime(b.breakEnd)}</TableCell>
                    <TableCell>
                      {b.breakMinutes != null
                        ? formatMinutes(b.breakMinutes)
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      <ManualAttendanceDialog
        open={manualDialogOpen}
        onClose={() => setManualDialogOpen(false)}
        editTarget={editTarget}
        fetchParams={dialogFetchParams}
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

export default AttendanceManagement;
