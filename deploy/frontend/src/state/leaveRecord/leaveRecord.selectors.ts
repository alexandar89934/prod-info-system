import { RootState } from '../store';

import { LeaveBalance, LeaveRecord } from './leaveRecord.types.ts';

export const selectLeaveRecords = (state: RootState): LeaveRecord[] =>
  state.reducer.leaveRecord.leaveRecords;

export const selectCurrentLeaveRecord = (state: RootState): LeaveRecord | null =>
  state.reducer.leaveRecord.currentLeaveRecord;

export const selectLeaveBalance = (state: RootState): LeaveBalance | null =>
  state.reducer.leaveRecord.leaveBalance;

export const selectLeaveRecordTotal = (state: RootState): number =>
  state.reducer.leaveRecord.total;

export const selectLeaveRecordLoading = (state: RootState): boolean =>
  state.reducer.leaveRecord.loading;

export const selectLeaveRecordError = (state: RootState): string | null =>
  state.reducer.leaveRecord.error;

export const selectLeaveRecordSuccess = (state: RootState): string | null =>
  state.reducer.leaveRecord.success;