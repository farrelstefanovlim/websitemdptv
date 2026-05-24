export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface Member {
  id: string;
  name: string;
  division: string;
  angkatan: number;
}

export interface AttendanceRecord {
  memberId: string;
  date: string;
  status: AttendanceStatus;
}

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Hadir",
  absent: "Absen",
  late: "Terlambat",
  excused: "Izin",
};

export const STATUS_ICONS: Record<AttendanceStatus, string> = {
  present: "check_circle",
  absent: "cancel",
  late: "schedule",
  excused: "info",
};
