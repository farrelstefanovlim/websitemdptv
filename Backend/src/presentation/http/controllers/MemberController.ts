import { Request, Response } from "express";
import prisma from "@infrastructure/database/prismaClient";
import { z } from "zod";

const memberSchema = z.object({
  full_name: z.string().min(2, "Nama wajib diisi"),
  npm: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  division_id: z.string().uuid("Divisi tidak valid").optional().nullable(),
  angkatan: z.number().int().min(2000, "Angkatan mahasiswa tidak valid").optional(),
  tahun_masuk: z.number().int().min(2000, "Tahun masuk MDPTV tidak valid").optional(),
  is_core: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

function deriveAngkatanFromNpm(npm?: string | null): number {
  if (npm && npm.trim().length >= 2) {
    const prefix = parseInt(npm.trim().substring(0, 2), 10);
    if (!isNaN(prefix) && prefix >= 10 && prefix <= 99) {
      return 2000 + prefix;
    }
  }
  return new Date().getFullYear();
}

export class MemberController {
  async getAll(req: Request, res: Response) {
    try {
      const members = await prisma.member.findMany({
        include: {
          division: {
            select: { id: true, name: true }
          }
        },
        orderBy: [{ is_core: 'desc' }, { is_active: 'desc' }, { created_at: 'desc' }],
      });
      res.json({ success: true, data: members });
    } catch (error) {
      console.error("[MemberController.getAll] Error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const parsed = memberSchema.parse(req.body);
      const angkatan = parsed.angkatan && parsed.angkatan >= 2000 
        ? parsed.angkatan 
        : deriveAngkatanFromNpm(parsed.npm);
      const tahunMasuk = parsed.tahun_masuk && parsed.tahun_masuk >= 2000 
        ? parsed.tahun_masuk 
        : new Date().getFullYear();

      const newMember = await prisma.member.create({
        data: {
          full_name: parsed.full_name,
          npm: parsed.npm || null,
          phone: parsed.phone || null,
          email: parsed.email || null,
          division_id: parsed.division_id || null,
          angkatan,
          tahun_masuk: tahunMasuk,
          is_core: parsed.is_core ?? false,
          is_active: parsed.is_active ?? true,
        },
        include: { division: { select: { id: true, name: true } } }
      });
      res.status(201).json({ success: true, data: newMember });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: error.errors[0].message });
      }
      res.status(500).json({ success: false, message: "Gagal membuat Data Anggota" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsed = memberSchema.partial().parse(req.body);
      
      const updated = await prisma.member.update({
        where: { id },
        data: {
          ...parsed,
          division_id: parsed.division_id === "" ? null : parsed.division_id,
        },
        include: { division: { select: { id: true, name: true } } }
      });
      res.json({ success: true, data: updated });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, message: "Anggota tidak ditemukan" });
      }
      res.status(500).json({ success: false, message: "Gagal mengupdate Data Anggota" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.$transaction([
        prisma.attendanceRecord.deleteMany({ where: { member_id: id } }),
        prisma.member.delete({ where: { id } }),
      ]);
      res.json({ success: true, message: "Berhasil menghapus Anggota beserta data absensinya" });
    } catch (error: any) {
      console.error("[MemberController.delete] Error:", error);
      res.status(500).json({ success: false, message: "Gagal menghapus data anggota." });
    }
  }

  async toggleActive(req: Request, res: Response) {
      try {
          const { id } = req.params;
          const targetMember = await prisma.member.findUnique({ where: { id } });
          if (!targetMember) return res.status(404).json({ success: false, message: "Anggota tidak ditemukan" });

          const updated = await prisma.member.update({
              where: { id },
              data: { is_active: !targetMember.is_active }
          });
          res.json({ success: true, data: updated });
      } catch (error) {
          res.status(500).json({ success: false, message: "Server error" });
      }
  }
}
