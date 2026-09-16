import api from "@/lib/axios";
import type { Member, AttendanceRecord, AttendanceStatus } from "@/components/feature/absensi/types/attendance.type";

/* ── Mappers ── */
const mapMember = (u: any): Member => ({
  id: u.id,
  name: u.full_name || u.fullName || u.username,
  npm: u.npm || "-",
  phone: u.phone || "-",
  email: u.email || "-",
  division_id: u.division_id,
  division: u.division?.name || "Umum",
  angkatan: u.angkatan || 2024,
});

const mapRecord = (r: any): AttendanceRecord => ({
  memberId: r.member_id,
  date: r.date ? new Date(r.date).toISOString().split("T")[0] : "",
  status: r.status as AttendanceStatus,
});

export const attendanceService = {
  /** Fetch members — returns frontend-ready Member[] */
  fetchMembers: async (): Promise<Member[]> => {
    const res = await api.get("/members");
    return (res.data.data || []).map(mapMember);
  },

  /** Fetch attendance records — returns frontend-ready AttendanceRecord[] */
  fetchRecords: async (params?: { month?: string; year?: string; user_id?: string }): Promise<AttendanceRecord[]> => {
    const res = await api.get("/attendance", { params });
    return (res.data.data || []).map(mapRecord);
  },

  /** Check-in / set attendance */
  checkIn: (member_id: string, status: string, date?: string) =>
    api.post("/attendance", { member_id, status, date }),

  /* Raw calls */
  getHistory: (params?: { month?: string; year?: string; user_id?: string }) =>
    api.get("/attendance", { params }),
};
