export type Attendance = {
  id: string;
  personId: string;
  date: string;
  checkIn: Date;
  checkOut: Date | null;
  workMinutes: number | null;
  regularMinutes: number | null;
  overtimeMinutes: number | null;
  nightMinutes: number | null;
  weekendMinutes: number | null;
  shiftType: "first" | "second" | "night" | null;
  note: string | null;
  overtimeStatus: "pending" | "approved" | "rejected" | null;
  systemClosed: boolean;
  isManualEntry: boolean;
  editedBy: string | null;
  editedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  personName?: string;
  employeeNumber?: number;
};

export type AttendanceWithPerson = Attendance & {
  personName: string;
  employeeNumber: number;
  breakCount: number;
  totalBreakMinutes: number;
};

export type KioskActionData =
  | { rfidCardNumber: string; employeeNumber?: never; pin?: never; action?: "checkout" | "break" }
  | { employeeNumber: string; pin: string; rfidCardNumber?: never; action?: "checkout" | "break" };

export type KioskActionResult =
  | { status: "checked_in"; personName: string; time: Date; attendance: Attendance }
  | { status: "checked_out"; personName: string; time: Date; attendance: Attendance }
  | { status: "break_started"; personName: string; time: Date }
  | { status: "returned_from_break"; personName: string; time: Date }
  | { status: "choice_required"; personName: string }
  | { status: "auto_closed_and_checked_in"; personName: string; time: Date; attendance: Attendance };

export type ManualAttendanceInput = {
  personId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  shiftType?: "first" | "second" | "night";
  note?: string;
};

export type ManualAttendanceUpdate = {
  date?: string;
  checkIn?: string;
  checkOut?: string;
  workMinutes?: number;
  regularMinutes?: number;
  overtimeMinutes?: number;
  nightMinutes?: number;
  weekendMinutes?: number;
  shiftType?: "first" | "second" | "night";
  note?: string;
  overtimeStatus?: "pending" | "approved" | "rejected" | null;
};

export type AttendanceBreak = {
  id: string;
  attendanceId: string;
  breakStart: Date;
  breakEnd: Date | null;
  breakMinutes: number | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PersonKioskLookup = {
  id: string;
  name: string;
  pin: string | null;
};

export type MonthlySummary = {
  totalWorkingDays: number;
  totalWorkMinutes: number;
  totalOvertimeMinutes: number;
  totalNightMinutes: number;
  totalWeekendMinutes: number;
  vacationDaysUsed: number;
  vacationDaysRemaining: number;
};