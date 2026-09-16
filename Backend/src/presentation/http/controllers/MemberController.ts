import { Request, Response } from "express";
import prisma from "@infrastructure/database/prismaClient";
import { z } from "zod";

const memberSchema = z.object({
  full_name: z.string().min(2, "Nama wajib diisi"),
  division_id: z.string().uuid("Divisi tidak valid").optional().nullable(),
  angkatan: z.number().int().min(2000, "Angkatan tidak valid"),
  is_core: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

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
      const newMember = await prisma.member.create({
        data: {
          full_name: parsed.full_name,
          division_id: parsed.division_id || null,
          angkatan: parsed.angkatan,
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
      await prisma.member.delete({ where: { id } });
      res.json({ success: true, message: "Berhasil menghapus Anggota" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Gagal menghapus anggota, mungkin masih tertaut ke absensi." });
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
