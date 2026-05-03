export type AttendanceEditRequest = {
  id: string;
  attendanceId: string;
  requestedBy: string;
  originalValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectReason: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  requestedByName?: string;
  approvedByName?: string;
};

export type CreateAttendanceEditRequestData = {
  attendanceId: string;
  requestedBy: string;
  originalValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
  reason: string;
};

export type ProcessAttendanceEditRequestData = {
  id: string;
  approvedBy: string;
  status: "approved" | "rejected";
  rejectReason?: string | null;
};