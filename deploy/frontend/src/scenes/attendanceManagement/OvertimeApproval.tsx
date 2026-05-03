import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import {
  approveOvertime,
  fetchPendingOvertime,
} from '@/state/attendance/attendance.actions.ts';
import {
  selectAttendanceLoading,
  selectPendingOvertime,
  selectPendingOvertimeLoading,
  selectPendingOvertimeTotal,
} from '@/state/attendance/attendance.selectors.ts';
import { Attendance } from '@/state/attendance/attendance.types.ts';
import { AppDispatch } from '@/state/store.ts';

const formatDate = (raw: string) => {
  const parts = raw.slice(0, 10).split('-');
  if (parts.length !== 3) return raw;
  return `${parts[2]}.${parts[1]}.${parts[0]}.`;
};

const formatMinutes = (mins: number | null) => {
  if (mins == null) return '-';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

const OvertimeApproval = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const records = useSelector(selectPendingOvertime);
  const total = useSelector(selectPendingOvertimeTotal);
  const loading = useSelector(selectPendingOvertimeLoading);
  const actionLoading = useSelector(selectAttendanceLoading);

  useEffect(() => {
    dispatch(fetchPendingOvertime({ page: 1, limit: 50 }));
  }, [dispatch]);

  const handleDecision = (row: Attendance, status: 'approved' | 'rejected') => {
    dispatch(approveOvertime({ id: row.id, status }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (records.length === 0) {
    return (
      <Box mt={4} textAlign="center">
        <Typography color="text.secondary">
          {t('attendance.overtime.noRecords')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {total}{' '}
        {t('attendance.overtime.noRecords').toLowerCase().replace('no ', '')}
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('attendance.columns.person')}</TableCell>
            <TableCell>{t('attendance.columns.date')}</TableCell>
            <TableCell>{t('attendance.columns.checkIn')}</TableCell>
            <TableCell>{t('attendance.columns.checkOut')}</TableCell>
            <TableCell>{t('attendance.columns.totalHours')}</TableCell>
            <TableCell>{t('attendance.columns.overtime')}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.personName}</TableCell>
              <TableCell>{formatDate(row.date)}</TableCell>
              <TableCell>
                {row.checkIn
                  ? new Date(row.checkIn).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-'}
              </TableCell>
              <TableCell>
                {row.checkOut
                  ? new Date(row.checkOut).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-'}
              </TableCell>
              <TableCell>{formatMinutes(row.workMinutes)}</TableCell>
              <TableCell>
                <Chip
                  label={formatMinutes(row.overtimeMinutes)}
                  color="warning"
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    disabled={actionLoading}
                    onClick={() => handleDecision(row, 'approved')}
                  >
                    {t('attendance.overtime.approve')}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={actionLoading}
                    onClick={() => handleDecision(row, 'rejected')}
                  >
                    {t('attendance.overtime.reject')}
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default OvertimeApproval;
