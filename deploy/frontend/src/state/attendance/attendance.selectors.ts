import { RootState } from '../store';

import {
  Attendance,
  AttendanceBreakRecord,
  MonthlySummary,
} from './attendance.types.ts';

export const selectAttendances = (state: RootState): Attendance[] =>
  state.reducer.attendance.attendances;

export const selectCurrentAttendance = (state: RootState): Attendance | null =>
  state.reducer.attendance.currentAttendance;

export const selectMonthlySummary = (state: RootState): MonthlySummary | null =>
  state.reducer.attendance.monthlySummary;

export const selectAttendanceTotal = (state: RootState): number =>
  state.reducer.attendance.total;

export const selectAttendanceLoading = (state: RootState): boolean =>
  state.reducer.attendance.loading;

export const selectAttendanceError = (state: RootState): string | null =>
  state.reducer.attendance.error;

export const selectAttendanceSuccess = (state: RootState): string | null =>
  state.reducer.attendance.success;

export const selectBreaks = (state: RootState): AttendanceBreakRecord[] =>
  state.reducer.attendance.breaks;

export const selectBreaksLoading = (state: RootState): boolean =>
  state.reducer.attendance.breaksLoading;

export const selectPendingOvertime = (state: RootState): Attendance[] =>
  state.reducer.attendance.pendingOvertime;

export const selectPendingOvertimeTotal = (state: RootState): number =>
  state.reducer.attendance.pendingOvertimeTotal;

export const selectPendingOvertimeLoading = (state: RootState): boolean =>
  state.reducer.attendance.pendingOvertimeLoading;
