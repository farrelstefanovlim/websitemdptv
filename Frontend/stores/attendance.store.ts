import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Member,
  AttendanceRecord,
  AttendanceStatus,
} from "@/components/feature/absensi/types/attendance.type";

import { attendanceService } from "@/services/attendance.service";
import { userService } from "@/services/user.service";

interface AttendanceState {
  members: Member[];
  records: AttendanceRecord[];
  lockedDates: string[];
  isLoading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  fetchRecords: (params?: { month?: string; year?: string; user_id?: string }) => Promise<void>;
  setAttendance: (memberId: string, date: string, status: AttendanceStatus) => Promise<void>;
  markAllPresent: (date: string) => void;
  clearDate: (date: string) => void;
  getRecordsByDate: (date: string) => AttendanceRecord[];
  getMemberStatus: (memberId: string, date: string) => AttendanceStatus | null;
  toggleLockDate: (date: string) => void;
  isDateLocked: (date: string) => boolean;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      members: [],
      records: [],
      lockedDates: [],
      isLoading: false,
      error: null,

      fetchMembers: async () => {
        set({ isLoading: true, error: null });
        try {
          const members = await attendanceService.fetchMembers();
          set({ members, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal memuat data anggota.", isLoading: false });
        }
      },

      fetchRecords: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const records = await attendanceService.fetchRecords(params);
          set({ records, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal memuat data absensi.", isLoading: false });
        }
      },

      setAttendance: async (memberId, date, status) => {
        try {
          await attendanceService.checkIn(memberId, status, date);
          set((state) => {
            const existingIndex = state.records.findIndex(
              (r) => r.memberId === memberId && r.date === date
            );
            if (existingIndex >= 0) {
              const newRecords = [...state.records];
              newRecords[existingIndex] = { memberId, date, status };
              return { records: newRecords };
            }
            return { records: [...state.records, { memberId, date, status }] };
          });
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Gagal mencatat absensi." });
        }
      },

      markAllPresent: (date) =>
        set((state) => {
          const memberIds = state.members.map((m) => m.id);
          const otherRecords = state.records.filter((r) => r.date !== date);
          const newRecords = memberIds.map((memberId) => ({
            memberId,
            date,
            status: "present" as AttendanceStatus,
          }));
          return { records: [...otherRecords, ...newRecords] };
        }),

      clearDate: (date) =>
        set((state) => ({
          records: state.records.filter((r) => r.date !== date),
        })),

      getRecordsByDate: (date) => get().records.filter((r) => r.date === date),

      getMemberStatus: (memberId, date) => {
        const record = get().records.find(
          (r) => r.memberId === memberId && r.date === date
        );
        return record?.status ?? null;
      },

      toggleLockDate: (date) =>
        set((state) => ({
          lockedDates: state.lockedDates.includes(date)
            ? state.lockedDates.filter((d) => d !== date)
            : [...state.lockedDates, date],
        })),

      isDateLocked: (date) => get().lockedDates.includes(date),
    }),
    { name: "mdptv-attendance" }
  )
);
