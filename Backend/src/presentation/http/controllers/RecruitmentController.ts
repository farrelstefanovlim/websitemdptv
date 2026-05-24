import { Request, Response, NextFunction } from "express";
import prisma from "@infrastructure/database/prismaClient";
import { z } from "zod";

const applicantSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi."),
  nim: z.string().min(1, "NIM wajib diisi."),
  email: z.string().email("Format email tidak valid."),
  phone: z.string().optional(),
  division_id: z.string().min(1, "Divisi wajib diisi."),
  motivation: z.string().min(10, "Motivasi minimal 10 karakter."),
});

export class RecruitmentController {
  public apply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = applicantSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ status: "error", message: validation.error.errors[0].message });
        return;
      }

      const { name, nim, email, phone, division_id, motivation } = validation.data;

      // Cek NIM duplikat
      const existing = await prisma.applicant.findUnique({ where: { nim } });
      if (existing) {
        res.status(409).json({ status: "error", message: "NIM sudah terdaftar sebagai pendaftar." });
        return;
      }

      // Resolve division UUID (in case frontend sends division name instead of UUID)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(division_id);
      const division = await prisma.division.findFirst({
        where: isUuid ? { id: division_id } : { name: division_id }
      });

      if (!division) {
        res.status(400).json({ status: "error", message: "Divisi tidak valid atau tidak ditemukan." });
        return;
      }

      await prisma.applicant.create({
        data: { name, nim, email, phone, division_id: division.id, motivation }
      });

      res.status(201).json({ status: "success", message: "Pendaftaran berhasil dikumpulkan." });
    } catch (error) {
      next(error);
    }
  };

  public getApplicants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, status, page: pageStr } = req.query;
      const page = parseInt(pageStr as string) || 1;
      const limit = 20;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { nim: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [applicants, total] = await Promise.all([
        prisma.applicant.findMany({
          where,
          include: { division: true },
          orderBy: { applied_at: "desc" },
          skip,
          take: limit,
        }),
        prisma.applicant.count({ where }),
      ]);

      res.status(200).json({
        status: "success",
        data: applicants,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, admin_note } = req.body;
      const reviewerId = (req as any).user?.id;

      const applicant = await prisma.applicant.update({
        where: { id },
        data: {
          status,
          admin_note,
          reviewed_by: reviewerId || null,
        }
      });

      if (status === "accepted") {
        const angkatan = new Date().getFullYear();
        const existingMember = await prisma.member.findFirst({
          where: { full_name: applicant.name, angkatan }
        });

        if (!existingMember) {
          await prisma.member.create({
            data: {
              full_name: applicant.name,
              division_id: applicant.division_id,
              angkatan,
              is_active: true
            }
          });
        }
      }

      res.status(200).json({ status: "success", message: `Status pendaftar berhasil diubah ke ${status}.` });
    } catch (error) {
      next(error);
    }
  };
}
