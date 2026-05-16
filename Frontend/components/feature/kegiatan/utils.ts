import type { KegiatanStatus } from "@/stores/kegiatan.store";

export const STATUS_CONFIG: Record<KegiatanStatus, { label: string; color: string; bg: string; icon: string }> = {
  draft: { label: "Draft", color: "text-on-surface-variant", bg: "bg-on-surface-variant/10", icon: "edit_note" },
  diajukan: { label: "Diajukan", color: "text-blue-600", bg: "bg-blue-50", icon: "send" },
  disetujui: { label: "Disetujui", color: "text-green-600", bg: "bg-green-50", icon: "check_circle" },
  ditolak: { label: "Ditolak", color: "text-red-500", bg: "bg-red-50", icon: "cancel" },
  selesai: { label: "Selesai", color: "text-purple-600", bg: "bg-purple-50", icon: "verified" },
};

export const ALL_STATUSES: KegiatanStatus[] = ["draft", "diajukan", "disetujui", "ditolak", "selesai"];

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
