import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Member,
  AttendanceRecord,
  AttendanceStatus,
} from "@/components/feature/absensi/types/attendance.type";

const DEFAULT_MEMBERS: Member[] = [
  { id: "m1", name: "Ahmad Rizky", division: "Photography & Videography" },
  { id: "m2", name: "Siti Nurhaliza", division: "Photography & Videography" },
  { id: "m3", name: "Budi Santoso", division: "Photography & Videography" },
  { id: "m4", name: "Dewi Lestari", division: "Graphic Design" },
  { id: "m5", name: "Farhan Maulana", division: "Graphic Design" },
  { id: "m6", name: "Gita Savitri", division: "Graphic Design" },
  { id: "m7", name: "Hendra Wijaya", division: "Kominfo" },
  { id: "m8", name: "Indah Permata", division: "Kominfo" },
  { id: "m9", name: "Joko Prasetyo", division: "Kominfo" },
  { id: "m10", name: "Kartika Sari", division: "Photography & Videography" },
  { id: "m11", name: "Lukman Hakim", division: "Graphic Design" },
  { id: "m12", name: "Maya Angelina", division: "Kominfo" },
];

interface AttendanceState {
  members: Member[];
  records: AttendanceRecord[];
  setAttendance: (memberId: string, date: string, status: AttendanceStatus) => void;
  markAllPresent: (date: string) => void;
  clearDate: (date: string) => void;
  getRecordsByDate: (date: string) => AttendanceRecord[];
  getMemberStatus: (memberId: string, date: string) => AttendanceStatus | null;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      members: DEFAULT_MEMBERS,
      records: [],

      setAttendance: (memberId, date, status) =>
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
        }),

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
    }),
    { name: "mdptv-attendance" }
  )
);
