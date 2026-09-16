import { Request, Response, NextFunction } from "express";
import prisma from "@infrastructure/database/prismaClient";
import { z } from "zod";

const applicantSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi."),
  nim: z.string().min(1, "NIM wajib diisi."),
  email: z.string().email("Format email tidak valid.").regex(/@mhs\.mdp\.ac\.id$/, "Gunakan email kampus (@mhs.mdp.ac.id)."),
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
      const existing = await prisma.applicant.findFirst({ where: { OR: [{ nim }, { email }] }});
      if (existing) {
        res.status(409).json({ status: "error", message: "NPM atau Email sudah terdaftar." });
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
    } catch (error:any) {
      if (error.code === "P2002") {
    res.status(409).json({ status: "error", message: "NIM atau Email sudah terdaftar." });
    return;
  }
  throw error;
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
        // Otomatis parsing 2 digit pertama NIM menjadi tahun angkatan / tahun masuk (contoh: '24...' -> 2024)
        let angkatan = new Date().getFullYear();
        if (applicant.nim && applicant.nim.length >= 2) {
          const prefix = applicant.nim.substring(0, 2);
          const parsedPrefix = parseInt(prefix, 10);
          if (!isNaN(parsedPrefix) && parsedPrefix >= 10 && parsedPrefix <= 99) {
            angkatan = 2000 + parsedPrefix;
          }
        }

        const existingMember = await prisma.member.findFirst({
          where: {
            OR: [
              { npm: applicant.nim },
              { full_name: applicant.name }
            ]
          }
        });

        if (!existingMember) {
          await prisma.member.create({
            data: {
              full_name: applicant.name,
              npm: applicant.nim,
              email: applicant.email,
              phone: applicant.phone,
              division_id: applicant.division_id,
              angkatan,
              is_core: false,
              is_active: true
            }
          });
        } else {
          await prisma.member.update({
            where: { id: existingMember.id },
            data: {
              is_active: true,
              division_id: applicant.division_id,
              npm: applicant.nim,
              email: applicant.email,
              phone: applicant.phone,
            }
          });
        }
      } else {
        // Jika status diubah kembali dari "accepted" ke "pending", "interview", atau "rejected"
        // Hapus data member dan absensinya agar hilang dari Rekap Absensi & Data Anggota
        const targetMembers = await prisma.member.findMany({
          where: {
            OR: [
              { npm: applicant.nim },
              { full_name: applicant.name }
            ]
          }
        });

        for (const m of targetMembers) {
          await prisma.attendanceRecord.deleteMany({ where: { member_id: m.id } });
          await prisma.member.delete({ where: { id: m.id } });
        }
      }

      res.status(200).json({ status: "success", message: `Status pendaftar berhasil diubah ke ${status}.` });
    } catch (error) {
      next(error);
    }
  };

  public getAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const setting = await prisma.siteSetting.findUnique({
        where: { key: "announcement_open" }
      });

      const isOpen = setting ? (setting.value as any)?.isOpen === true : false;
      
      if (!isOpen) {
        res.status(200).json({ status: "success", data: { isOpen: false, accepted: [] } });
        return;
      }

      const accepted = await prisma.applicant.findMany({
        where: { status: "accepted" },
        include: { division: true },
        orderBy: { name: "asc" }
      });

      // Filter only safe fields to public interface
      const sanitized = accepted.map((a: any) => ({
        name: a.name,
        divisionName: a.division?.name || "",
        nim: a.nim.substring(0, 4) + "****" // Mask sensitive part of NIM just to be safe
      }));

      res.status(200).json({ status: "success", data: { isOpen: true, accepted: sanitized } });
    } catch (error) {
      next(error);
    }
  };

  public toggleAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isOpen } = req.body;

      if (typeof isOpen !== "boolean") {
        res.status(400).json({ status: "error", message: "Parameter isOpen harus berupa boolean." });
        return;
      }

      const updated = await prisma.siteSetting.upsert({
        where: { key: "announcement_open" },
        update: { value: { isOpen } },
        create: { key: "announcement_open", value: { isOpen } }
      });

      res.status(200).json({ 
        status: "success", 
        message: isOpen ? "Pengumuman berhasil dibuka." : "Pengumuman berhasil ditutup.",
        data: { isOpen: (updated.value as any)?.isOpen }
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // FITUR BARU: WHATSAPP GROUP LINK
  // ==========================================
  public getWhatsAppLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const setting = await prisma.siteSetting.findUnique({
        where: { key: "whatsapp_group_link" }
      });

      const link = setting ? (setting.value as any)?.link || "" : "";
      
      res.status(200).json({ status: "success", data: link });
    } catch (error) {
      next(error);
    }
  };

  public updateWhatsAppLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { link } = req.body;

      if (typeof link !== "string") {
        res.status(400).json({ status: "error", message: "Parameter link wajib diisi dan harus berupa string." });
        return;
      }

      const updated = await prisma.siteSetting.upsert({
        where: { key: "whatsapp_group_link" },
        update: { value: { link } },
        create: { key: "whatsapp_group_link", value: { link } }
      });

      res.status(200).json({ 
        status: "success", 
        message: "Link WhatsApp berhasil diperbarui.",
        data: (updated.value as any)?.link
      });
    } catch (error) {
      next(error);
    }
  };
}
