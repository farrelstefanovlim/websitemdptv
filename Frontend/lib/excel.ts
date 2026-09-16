import * as XLSX from "xlsx";

/* ──────────────────────────────────────────────────────
   Shared Excel import / export utilities for MDPTV admin
   ────────────────────────────────────────────────────── */

type Column = { key: string; header: string };

/** Export an array of objects as an .xlsx file */
export function exportToExcel(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[],
  columns: Column[],
  fileName: string,
  sheetName = "Sheet1"
) {
  const rows = data.map((item) =>
    columns.reduce(
      (acc, col) => {
        acc[col.header] = item[col.key] ?? "";
        return acc;
      },
      {} as Record<string, unknown>
    )
  );
  const ws = XLSX.utils.json_to_sheet(rows);

  /* Auto-size columns based on header + content width */
  const colWidths = columns.map((col) => {
    const maxContent = Math.max(
      col.header.length,
      ...data.map((d) => String(d[col.key] ?? "").length)
    );
    return { wch: Math.min(Math.max(maxContent + 2, 10), 50) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

/** Read an .xlsx file and return rows as key-value objects */
export function importFromExcel(
  file: File,
  columnMap: Column[]
): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

        const mapped = raw.map((row) => {
          const obj: Record<string, string> = {};
          for (const { header, key } of columnMap) {
            if (row[header] !== undefined) {
              obj[key] = String(row[header]);
            }
          }
          return obj;
        });
        resolve(mapped);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/* ── Preset column configs for each data type ──────── */

export const MEMBERS_COLUMNS: Column[] = [
  { key: "name", header: "Nama Lengkap" },
  { key: "division", header: "Divisi" },
  { key: "category", header: "Kategori (Inti/Biasa)" },
  { key: "angkatan", header: "Angkatan" },
  { key: "is_active", header: "Status Aktif" },
];

export const ABSENSI_COLUMNS: Column[] = [
  { key: "npm", header: "NPM" },
  { key: "name", header: "Nama Anggota" },
  { key: "phone", header: "No HP" },
  { key: "email", header: "Email" },
  { key: "status", header: "Status" },
  { key: "division", header: "Divisi" },
  { key: "date", header: "Tanggal Absensi" },
];

export const RECRUITMENT_COLUMNS: Column[] = [
  { key: "name", header: "Nama" },
  { key: "npm", header: "NPM" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Telepon" },
  { key: "division", header: "Divisi" },
  { key: "motivation", header: "Motivasi" },
  { key: "status", header: "Status" },
  { key: "adminNote", header: "Catatan Admin" },
  { key: "appliedAt", header: "Tanggal Daftar" },
];

export const KEGIATAN_COLUMNS: Column[] = [
  { key: "title", header: "Judul" },
  { key: "description", header: "Deskripsi" },
  { key: "division", header: "Divisi" },
  { key: "date", header: "Tanggal" },
  { key: "location", header: "Lokasi" },
  { key: "status", header: "Status" },
  { key: "pic", header: "PIC" },
  { key: "budget", header: "Anggaran" },
  { key: "notes", header: "Catatan" },
  { key: "createdAt", header: "Dibuat" },
];
