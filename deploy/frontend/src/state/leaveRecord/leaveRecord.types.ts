import { ApiResponse } from '@/state/defaultResponse.ts';

export interface LeaveRecord {
  id: string;
  personId: string;
  type: 'vacation' | 'sick' | 'other';
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDayPart: 'morning' | 'afternoon' | null;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy: string | null;
  approvedAt: string | null;
  requestNote: string | null;
  rejectReason: string | null;
  documents: string[];
  createdAt: string;
  updatedAt: string;
  personName?: string;
  approvedByName?: string;
}

export interface LeaveBalance {
  id: string;
  personId: string;
  year: number;
  totalVacationDays: string;
  usedDays: number;
  remainingDays: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
}

export interface LeaveRecordFetchParams {
  page?: number;
  limit?: number;
  personId?: string;
  type?: string;
  status?: string;
  year?: number;
  sortField?: string;
  sortOrder?: string;
}

export type CreateLeaveRecordData = {
  personId: string;
  type: 'vacation' | 'sick' | 'other';
  startDate: string;
  endDate: string;
  isHalfDay?: boolean;
  halfDayPart?: 'morning' | 'afternoon' | null;
  requestNote?: string | null;
  documents?: string[];
};

export type ApproveLeaveRecordData = {
  id: string;
  approvedBy: string;
  status: 'approved' | 'rejected';
  rejectReason?: string | null;
};

export type LeaveRecordListResponse = ApiResponse<{
  leaveRecords: LeaveRecord[];
  pagination: Pagination;
}>;

export type LeaveRecordSingleResponse = ApiResponse<{
  leaveRecord: LeaveRecord;
}>;

export type LeaveBalanceResponse = ApiResponse<{
  balance: LeaveBalance;
}>;

export type LeaveRecordState = {
  leaveRecords: LeaveRecord[];
  currentLeaveRecord: LeaveRecord | null;
  leaveBalance: LeaveBalance | null;
  total: number;
  loading: boolean;
  error: string | null;
  success: string | null;
};