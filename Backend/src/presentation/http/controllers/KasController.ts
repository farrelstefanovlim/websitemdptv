import { Request, Response } from "express";
import prisma from "@infrastructure/database/prismaClient";
import * as XLSX from "xlsx";

export class KasController {
  // GET /api/v1/kas - Mengambil semua log kas & ringkasan
  async getAll(req: Request, res: Response) {
    try {
      const records = await prisma.kasRecord.findMany({
        orderBy: [{ date: "asc" }, { created_at: "asc" }],
      });

      let totalPemasukan = 0;
      let totalPengeluaran = 0;
      let currentBalance = 0;

      // Hitung ulang akumulasi saldo secara berurutan
      const formattedRecords = records.map((r) => {
        const amt = r.amount || 0;
        const isIncome = r.type.toUpperCase() === "IN" || r.type.toLowerCase().includes("masuk") || r.type.toLowerCase().includes("pemasukan");
        
        if (isIncome) {
          totalPemasukan += amt;
          currentBalance += amt;
        } else {
          totalPengeluaran += amt;
          currentBalance -= amt;
        }

        return {
          ...r,
          type: isIncome ? "IN" : "OUT",
          balance: currentBalance,
        };
      });

      res.json({
        success: true,
        summary: {
          totalPemasukan,
          totalPengeluaran,
          saldoAkhir: currentBalance,
          totalTransaksi: records.length,
        },
        data: formattedRecords,
      });
    } catch (error: any) {
      console.error("[KasController.getAll] Error:", error);
      res.status(500).json({ success: false, message: "Gagal memuat data uang kas" });
    }
  }

  // POST /api/v1/kas/upload - Bulk upload data kas dari Excel JSON atau File
  async uploadExcel(req: Request, res: Response) {
    try {
      let items: any[] = [];
      const user = (req as any).user;
      const uploadedBy = user ? user.username || user.email : "Admin";

      // Jika request berupa array JSON `items`
      if (req.body.items && Array.isArray(req.body.items)) {
        items = req.body.items;
      } else if (req.file) {
        // Jika request berupa multipart file upload
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        items = XLSX.utils.sheet_to_json(worksheet);
      }

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: "Data file/item Excel kosong atau tidak valid" });
      }

      // Normalisasi baris data Excel
      const toCreate: any[] = [];
      for (const row of items) {
        const rawDate = row.Tanggal || row.date || row.tanggal || new Date().toISOString();
        const description = row.Keterangan || row.description || row.keterangan || "Transaksi Kas";
        const category = row.Kategori || row.category || row.kategori || "Umum";
        
        let rawType = String(row.Tipe || row.type || row.tipe || row.Jenis || row.jenis || "IN").toUpperCase();
        let amount = parseFloat(row.Nominal || row.amount || row.nominal || row.Jumlah || row.jumlah || 0);

        if (isNaN(amount)) amount = 0;

        let type = "IN";
        if (rawType.includes("OUT") || rawType.includes("KELUAR") || rawType.includes("PENGELUARAN")) {
          type = "OUT";
        }

        const dateObj = new Date(rawDate);
        const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;

        toCreate.push({
          date: validDate,
          description: String(description),
          category: String(category),
          type,
          amount,
          uploaded_by: uploadedBy,
        });
      }

      // Opsional: Hapus data kas lama jika flag replace dipasang
      if (req.query.replace === "true") {
        await prisma.kasRecord.deleteMany();
      }

      await prisma.kasRecord.createMany({
        data: toCreate,
      });

      res.status(201).json({
        success: true,
        message: `Berhasil mengunggah ${toCreate.length} transaksi kas.`,
      });
    } catch (error: any) {
      console.error("[KasController.uploadExcel] Error:", error);
      res.status(500).json({ success: false, message: "Gagal memproses file/data Excel" });
    }
  }

  // POST /api/v1/kas - Tambah 1 transaksi manual
  async create(req: Request, res: Response) {
    try {
      const { date, description, category, type, amount, notes } = req.body;

      if (!description || amount === undefined) {
        return res.status(400).json({ success: false, message: "Keterangan dan nominal wajib diisi." });
      }

      const rawType = String(type || "IN").toUpperCase();
      const isIncome = rawType === "IN" || rawType.includes("MASUK");

      const user = (req as any).user;
      const uploadedBy = user ? user.username || user.email : "Admin";

      const created = await prisma.kasRecord.create({
        data: {
          date: date ? new Date(date) : new Date(),
          description,
          category: category || "Umum",
          type: isIncome ? "IN" : "OUT",
          amount: parseFloat(amount),
          notes: notes || null,
          uploaded_by: uploadedBy,
        },
      });

      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      console.error("[KasController.create] Error:", error);
      res.status(500).json({ success: false, message: "Gagal menambah transaksi kas" });
    }
  }

  // DELETE /api/v1/kas/:id - Hapus 1 transaksi
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.kasRecord.delete({ where: { id } });
      res.json({ success: true, message: "Transaksi berhasil dihapus" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Gagal menghapus transaksi kas" });
    }
  }

  // DELETE /api/v1/kas - Reset seluruh log
  async deleteAll(req: Request, res: Response) {
    try {
      await prisma.kasRecord.deleteMany();
      res.json({ success: true, message: "Semua log transaksi kas berhasil dibersihkan" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Gagal membersihkan log kas" });
    }
  }

  // ================= UNPAID KAS (TUNGGAKAN) METHODS =================

  // GET /api/v1/kas/unpaid - Ambil seluruh data anggota belum bayar kas
  async getUnpaid(req: Request, res: Response) {
    try {
      const records = await prisma.kasUnpaidRecord.findMany({
        orderBy: [{ created_at: "desc" }],
      });

      let totalTunggakan = 0;
      let totalBelumBayar = 0;
      let totalLunas = 0;

      records.forEach((r) => {
        if (r.status === "BELUM_BAYAR") {
          totalBelumBayar++;
          totalTunggakan += r.amount || 0;
        } else {
          totalLunas++;
        }
      });

      res.json({
        success: true,
        summary: {
          totalBelumBayar,
          totalLunas,
          totalTunggakan,
          totalAnggota: records.length,
        },
        data: records,
      });
    } catch (error: any) {
      console.error("[KasController.getUnpaid] Error:", error);
      res.status(500).json({ success: false, message: "Gagal memuat data tunggakan kas" });
    }
  }

  // POST /api/v1/kas/unpaid - Tambah data tunggakan manual
  async createUnpaid(req: Request, res: Response) {
    try {
      const { member_name, npm, division, period, amount, status, notes } = req.body;

      if (!member_name || !period) {
        return res.status(400).json({ success: false, message: "Nama anggota dan periode wajib diisi." });
      }

      const user = (req as any).user;
      const uploadedBy = user ? user.username || user.email : "Admin";

      const created = await prisma.kasUnpaidRecord.create({
        data: {
          member_name: member_name.trim(),
          npm: npm ? String(npm).trim() : null,
          division: division ? String(division).trim() : null,
          period: String(period).trim(),
          amount: parseFloat(amount || 0),
          status: status === "LUNAS" ? "LUNAS" : "BELUM_BAYAR",
          notes: notes ? String(notes).trim() : null,
          uploaded_by: uploadedBy,
        },
      });

      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      console.error("[KasController.createUnpaid] Error:", error);
      res.status(500).json({ success: false, message: "Gagal menambah data tunggakan kas" });
    }
  }

  // PUT /api/v1/kas/unpaid/:id - Edit atau ubah status tunggakan
  async updateUnpaid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { member_name, npm, division, period, amount, status, notes } = req.body;

      const updated = await prisma.kasUnpaidRecord.update({
        where: { id },
        data: {
          ...(member_name && { member_name: member_name.trim() }),
          ...(npm !== undefined && { npm: npm ? String(npm).trim() : null }),
          ...(division !== undefined && { division: division ? String(division).trim() : null }),
          ...(period && { period: String(period).trim() }),
          ...(amount !== undefined && { amount: parseFloat(amount) }),
          ...(status && { status: status === "LUNAS" ? "LUNAS" : "BELUM_BAYAR" }),
          ...(notes !== undefined && { notes: notes ? String(notes).trim() : null }),
        },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      console.error("[KasController.updateUnpaid] Error:", error);
      res.status(400).json({ success: false, message: "Gagal mengbarui data tunggakan" });
    }
  }

  // DELETE /api/v1/kas/unpaid/:id - Hapus 1 record tunggakan
  async deleteUnpaid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.kasUnpaidRecord.delete({ where: { id } });
      res.json({ success: true, message: "Data tunggakan berhasil dihapus" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Gagal menghapus data tunggakan" });
    }
  }

  // POST /api/v1/kas/unpaid/upload - Import massal dari Excel
  async uploadUnpaidExcel(req: Request, res: Response) {
    try {
      let items: any[] = [];
      const user = (req as any).user;
      const uploadedBy = user ? user.username || user.email : "Admin";

      if (req.body.items && Array.isArray(req.body.items)) {
        items = req.body.items;
      } else if (req.file) {
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        items = XLSX.utils.sheet_to_json(worksheet);
      }

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: "Data Excel kosong atau format tidak valid" });
      }

      const toCreate: any[] = [];
      for (const row of items) {
        const member_name = row["Nama Anggota"] || row.Nama || row.nama || row.member_name || row["Nama"] || "Tanpa Nama";
        const npm = row.NPM || row.npm || row.NIM || row.nim || null;
        const division = row.Divisi || row.divisi || row.division || row.Jabatan || null;
        const period = row.Periode || row.periode || row.period || row.Bulan || row.bulan || "Periode Kas";
        let amount = parseFloat(row.Jumlah || row.jumlah || row.Nominal || row.nominal || row.amount || row.Tunggakan || 0);
        if (isNaN(amount)) amount = 0;

        const rawStatus = String(row.Status || row.status || "BELUM_BAYAR").toUpperCase();
        const status = rawStatus.includes("LUNAS") || rawStatus.includes("PAID") ? "LUNAS" : "BELUM_BAYAR";
        const notes = row.Keterangan || row.keterangan || row.notes || null;

        toCreate.push({
          member_name: String(member_name).trim(),
          npm: npm ? String(npm).trim() : null,
          division: division ? String(division).trim() : null,
          period: String(period).trim(),
          amount,
          status,
          notes: notes ? String(notes).trim() : null,
          uploaded_by: uploadedBy,
        });
      }

      if (req.query.replace === "true") {
        await prisma.kasUnpaidRecord.deleteMany();
      }

      await prisma.kasUnpaidRecord.createMany({
        data: toCreate,
      });

      res.status(201).json({
        success: true,
        message: `Berhasil mengunggah ${toCreate.length} data anggota tunggakan kas.`,
      });
    } catch (error: any) {
      console.error("[KasController.uploadUnpaidExcel] Error:", error);
      res.status(500).json({ success: false, message: "Gagal mengunggah data Excel tunggakan kas" });
    }
  }
}

