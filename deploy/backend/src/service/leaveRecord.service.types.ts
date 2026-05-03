export type LeaveRecord = {
  id: string;
  personId: string;
  type: "vacation" | "sick" | "other";
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDayPart: "morning" | "afternoon" | null;
  status: "pending" | "approved" | "rejected";
  approvedBy: string | null;
  approvedAt: Date | null;
  requestNote: string | null;
  rejectReason: string | null;
  documents: string[];
  createdAt?: Date;
  updatedAt?: Date;
  personName?: string;
  approvedByName?: string;
};

export type CreateLeaveRecordData = {
  personId: string;
  type: "vacation" | "sick" | "other";
  startDate: string;
  endDate: string;
  isHalfDay?: boolean;
  halfDayPart?: "morning" | "afternoon" | null;
  requestNote?: string | null;
  documents?: string[];
};

export type ApproveLeaveRecordData = {
  id: string;
  approvedBy: string;
  status: "approved" | "rejected";
  rejectReason?: string | null;
};

export type LeaveBalance = {
  id: string;
  personId: string;
  year: number;
  totalVacationDays: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type LeaveBalanceWithUsed = LeaveBalance & {
  usedDays: number;
  remainingDays: number;
};