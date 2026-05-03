import { ApiResponse } from '@/state/defaultResponse.ts';

export interface AttendanceBreakRecord {
  id: string;
  attendanceId: string;
  breakStart: string;
  breakEnd: string | null;
  breakMinutes: number | null;
}

export interface Attendance {
  id: string;
  personId: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  workMinutes: number | null;
  regularMinutes: number | null;
  overtimeMinutes: number | null;
  nightMinutes: number | null;
  weekendMinutes: number | null;
  shiftType: 'first' | 'second' | 'night' | null;
  note: string | null;
  overtimeStatus: 'pending' | 'approved' | 'rejected' | null;
  systemClosed: boolean;
  isManualEntry: boolean;
  editedBy: string | null;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
  personName?: string;
  employeeNumber?: number;
  breakCount?: number;
  totalBreakMinutes?: number;
}

export type KioskStatus =
  | 'checked_in'
  | 'checked_out'
  | 'break_started'
  | 'returned_from_break'
  | 'choice_required'
  | 'auto_closed_and_checked_in';

export interface ManualAttendanceFormData {
  personId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  shiftType?: 'first' | 'second' | 'night';
  note?: string;
}

export interface ManualAttendanceUpdateData {
  checkIn?: string;
  checkOut?: string;
  workMinutes?: number;
  regularMinutes?: number;
  overtimeMinutes?: number;
  nightMinutes?: number;
  weekendMinutes?: number;
  shiftType?: 'first' | 'second' | 'night';
  note?: string;
}

export interface KioskResult {
  status: KioskStatus;
  personName: string;
  time?: string;
  attendance?: Attendance;
}

export interface MonthlySummary {
  totalWorkingDays: number;
  totalWorkMinutes: number;
  totalOvertimeMinutes: number;
  totalNightMinutes: number;
  totalWeekendMinutes: number;
  vacationDaysUsed: number;
  vacationDaysRemaining: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
}

export interface AttendanceFetchParams {
  page?: number;
  limit?: number;
  personId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortField?: string;
  sortOrder?: string;
}

export type AttendanceListResponse = ApiResponse<{
  attendances: Attendance[];
  pagination: Pagination;
}>;

export type AttendanceSingleResponse = ApiResponse<{
  attendance: Attendance;
}>;

export type MonthlySummaryResponse = ApiResponse<{
  summary: MonthlySummary;
}>;

export type AttendanceBreaksResponse = ApiResponse<{
  breaks: AttendanceBreakRecord[];
}>;

export type AttendancePendingOvertimeResponse = ApiResponse<{
  attendances: Attendance[];
  pagination: Pagination;
}>;

export type AttendanceState = {
  attendances: Attendance[];
  currentAttendance: Attendance | null;
  monthlySummary: MonthlySummary | null;
  breaks: AttendanceBreakRecord[];
  breaksLoading: boolean;
  pendingOvertime: Attendance[];
  pendingOvertimeTotal: number;
  pendingOvertimeLoading: boolean;
  total: number;
  loading: boolean;
  error: string | null;
  success: string | null;
};
