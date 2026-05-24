import type { KegiatanStatus } from "@/stores/kegiatan.store";

export const STATUS_CONFIG: Record<KegiatanStatus, { label: string; color: string; bg: string; border: string; activeBg: string; activeBorder: string; activeShadow: string; icon: string }> = {
  draft: { 
    label: "Draft", color: "text-on-surface-variant", 
    bg: "bg-surface-container-low", border: "border-outline-variant/20", 
    activeBg: "bg-surface-container-high", activeBorder: "border-on-surface-variant/40", activeShadow: "shadow-sm",
    icon: "edit_note" 
  },
  diajukan: { 
    label: "Diajukan", color: "text-blue-600", 
    bg: "bg-blue-50/50", border: "border-blue-200/50", 
    activeBg: "bg-blue-50", activeBorder: "border-blue-400/60", activeShadow: "shadow-blue-500/10",
    icon: "send" 
  },
  disetujui: { 
    label: "Disetujui", color: "text-green-600", 
    bg: "bg-green-50/50", border: "border-green-200/50", 
    activeBg: "bg-green-50", activeBorder: "border-green-400/60", activeShadow: "shadow-green-500/10",
    icon: "check_circle" 
  },
  ditolak: { 
    label: "Ditolak", color: "text-red-500", 
    bg: "bg-red-50/50", border: "border-red-200/50", 
    activeBg: "bg-red-50", activeBorder: "border-red-400/60", activeShadow: "shadow-red-500/10",
    icon: "cancel" 
  },
  selesai: { 
    label: "Selesai", color: "text-purple-600", 
    bg: "bg-purple-50/50", border: "border-purple-200/50", 
    activeBg: "bg-purple-50", activeBorder: "border-purple-400/60", activeShadow: "shadow-purple-500/10",
    icon: "verified" 
  },
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
