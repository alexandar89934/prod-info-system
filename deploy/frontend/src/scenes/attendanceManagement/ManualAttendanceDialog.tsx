import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import {
  createManualAttendance,
  fetchAttendances,
  updateManualAttendance,
} from '@/state/attendance/attendance.actions.ts';
import {
  Attendance,
  AttendanceFetchParams,
  ManualAttendanceFormData,
} from '@/state/attendance/attendance.types.ts';
import { fetchPersons } from '@/state/person/person.actions.ts';
import { selectPersons } from '@/state/person/person.selectors.ts';
import { PersonFormDataBase } from '@/state/person/person.types.ts';
import { AppDispatch } from '@/state/store.ts';

interface Props {
  open: boolean;
  onClose: () => void;
  editTarget: Attendance | null;
  fetchParams: AttendanceFetchParams;
}

const splitLocalDateTime = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    hours: pad(d.getHours()),
    minutes: pad(d.getMinutes()),
  };
};

const buildISO = (date: string, hours: string, minutes: string): string | null => {
  if (!date || hours === '' || minutes === '') return null;
  return `${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};

const DateTimeRow = ({
  label,
  date, onDateChange,
  hours, onHoursChange,
  minutes, onMinutesChange,
}: {
  label: string;
  date: string; onDateChange: (v: string) => void;
  hours: string; onHoursChange: (v: string) => void;
  minutes: string; onMinutesChange: (v: string) => void;
}) => {
  const dateRef = useRef<HTMLInputElement>(null);

  const clampHours = (v: string) => {
    const n = parseInt(v, 10);
    if (isNaN(n)) return '';
    return String(Math.min(23, Math.max(0, n))).padStart(2, '0');
  };

  const clampMinutes = (v: string) => {
    const n = parseInt(v, 10);
    if (isNaN(n)) return '';
    return String(Math.min(59, Math.max(0, n))).padStart(2, '0');
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
      <TextField
        label={label}
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        onClick={() => dateRef.current?.showPicker()}
        inputRef={dateRef}
        size="small"
        InputLabelProps={{ shrink: true }}
        sx={{ flex: 1 }}
      />
      <TextField
        label="HH"
        type="number"
        value={hours}
        onChange={(e) => onHoursChange(e.target.value)}
        onBlur={(e) => onHoursChange(clampHours(e.target.value))}
        size="small"
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: 0, max: 23 }}
        sx={{ width: 72 }}
      />
      <Box sx={{ pb: '6px', color: 'text.secondary' }}>
        <Typography variant="h6">:</Typography>
      </Box>
      <TextField
        label="mm"
        type="number"
        value={minutes}
        onChange={(e) => onMinutesChange(e.target.value)}
        onBlur={(e) => onMinutesChange(clampMinutes(e.target.value))}
        size="small"
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: 0, max: 59 }}
        sx={{ width: 72 }}
      />
    </Box>
  );
};

const ManualAttendanceDialog = ({
  open,
  onClose,
  editTarget,
  fetchParams,
}: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const persons = useSelector(selectPersons);

  const [selectedPerson, setSelectedPerson] = useState<PersonFormDataBase | null>(null);

  const [checkInDate, setCheckInDate] = useState('');
  const [checkInHours, setCheckInHours] = useState('');
  const [checkInMinutes, setCheckInMinutes] = useState('');

  const [checkOutDate, setCheckOutDate] = useState('');
  const [checkOutHours, setCheckOutHours] = useState('');
  const [checkOutMinutes, setCheckOutMinutes] = useState('');

  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      dispatch(fetchPersons({ page: 1, limit: 1000, search: '' }));
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (editTarget) {
      if (editTarget.checkIn) {
        const p = splitLocalDateTime(editTarget.checkIn);
        setCheckInDate(p.date);
        setCheckInHours(p.hours);
        setCheckInMinutes(p.minutes);
      } else {
        setCheckInDate(''); setCheckInHours(''); setCheckInMinutes('');
      }
      if (editTarget.checkOut) {
        const p = splitLocalDateTime(editTarget.checkOut);
        setCheckOutDate(p.date);
        setCheckOutHours(p.hours);
        setCheckOutMinutes(p.minutes);
      } else {
        setCheckOutDate(''); setCheckOutHours(''); setCheckOutMinutes('');
      }
      setNote(editTarget.note ?? '');
    } else {
      setSelectedPerson(null);
      setCheckInDate(''); setCheckInHours(''); setCheckInMinutes('');
      setCheckOutDate(''); setCheckOutHours(''); setCheckOutMinutes('');
      setNote('');
    }
  }, [editTarget, open]);

  const autoFillCheckOut = (date: string, hours: string, minutes: string) => {
    if (!editTarget && date && hours !== '' && minutes !== '') {
      const base = new Date(
        `${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
      );
      const out = splitLocalDateTime(
        new Date(base.getTime() + 480 * 60 * 1000).toISOString()
      );
      setCheckOutDate(out.date);
      setCheckOutHours(out.hours);
      setCheckOutMinutes(out.minutes);
    }
  };

  const handleCheckInDateChange = (v: string) => {
    setCheckInDate(v);
    autoFillCheckOut(v, checkInHours, checkInMinutes);
  };

  const handleCheckInHoursChange = (v: string) => {
    setCheckInHours(v);
    autoFillCheckOut(checkInDate, v, checkInMinutes);
  };

  const handleCheckInMinutesChange = (v: string) => {
    setCheckInMinutes(v);
    autoFillCheckOut(checkInDate, checkInHours, v);
  };

  const handleSubmit = async () => {
    const checkInISO = buildISO(checkInDate, checkInHours, checkInMinutes);
    const checkOutISO = buildISO(checkOutDate, checkOutHours, checkOutMinutes);

    if (editTarget) {
      const updateData: Record<string, string> = {};
      if (checkInISO) updateData.checkIn = checkInISO;
      if (checkOutISO) updateData.checkOut = checkOutISO;
      if (note !== editTarget.note) updateData.note = note;

      await dispatch(updateManualAttendance({ id: editTarget.id, data: updateData }));
    } else {
      if (!selectedPerson?.id || !checkInISO) return;
      const createData: ManualAttendanceFormData = {
        personId: selectedPerson.id,
        date: checkInDate,
        checkIn: checkInISO,
      };
      if (checkOutISO) createData.checkOut = checkOutISO;
      if (note) createData.note = note;

      await dispatch(createManualAttendance(createData));
    }

    dispatch(fetchAttendances(fetchParams));
    onClose();
  };

  const hasCheckIn = !!checkInDate && checkInHours !== '' && checkInMinutes !== '';
  const hasCheckOut = !!checkOutDate && checkOutHours !== '' && checkOutMinutes !== '';
  const isCreateValid = !editTarget && !!selectedPerson?.id && hasCheckIn;
  const isEditValid = !!editTarget && !!(hasCheckIn || hasCheckOut || note !== editTarget.note);
  const isValid = isCreateValid || isEditValid;

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => { if (reason !== 'backdropClick') onClose(); }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {editTarget
          ? t('attendance.manualEntry.editTitle')
          : t('attendance.manualEntry.createTitle')}
      </DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '20px !important' }}
      >
        {!editTarget && (
          <Autocomplete
            options={persons}
            getOptionLabel={(p) => `${p.name} (${p.employeeNumber})`}
            value={selectedPerson}
            onChange={(_, value) => setSelectedPerson(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('attendance.manualEntry.person')}
                size="small"
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        )}
        <DateTimeRow
          label={t('attendance.manualEntry.checkIn')}
          date={checkInDate} onDateChange={handleCheckInDateChange}
          hours={checkInHours} onHoursChange={handleCheckInHoursChange}
          minutes={checkInMinutes} onMinutesChange={handleCheckInMinutesChange}
        />
        <DateTimeRow
          label={t('attendance.manualEntry.checkOut')}
          date={checkOutDate} onDateChange={setCheckOutDate}
          hours={checkOutHours} onHoursChange={setCheckOutHours}
          minutes={checkOutMinutes} onMinutesChange={setCheckOutMinutes}
        />
        <TextField
          label={t('attendance.manualEntry.note')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          fullWidth
          size="small"
          multiline
          rows={2}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            color: theme.palette.primary[100],
            borderColor: theme.palette.primary[100],
            '&:hover': {
              borderColor: theme.palette.primary[200],
              backgroundColor: theme.palette.primary[100],
              color: theme.palette.common.white,
            },
          }}
        >
          {t('attendance.manualEntry.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid}
          sx={{ color: theme.palette.primary[200] }}
        >
          {t('attendance.manualEntry.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManualAttendanceDialog;