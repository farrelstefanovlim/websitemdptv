import { Request, Response, NextFunction } from "express"
import prisma from "@infrastructure/database/prismaClient"
import { z } from "zod"

const applicantSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi."),
  npm: z.string().min(1, "NPM wajib diisi."),
  email: z
    .string()
    .email("Format email tidak valid.")
    .regex(/@mhs\.mdp\.ac\.id$/, "Gunakan email kampus."),
  phone: z.string().optional(),
  division_id: z.string().min(1, "Divisi wajib diisi."),
  motivation: z.string().min(10, "Motivasi minimal 10 karakter."),
  cv_url: z.string().optional().nullable(),
  portfolio_url: z.string().optional().nullable(),
  period: z.string().optional(),
})

export class RecruitmentController {
  public apply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = applicantSchema.safeParse(req.body)

      if (!validation.success) {
        res.status(400).json({ status: "error", message: validation.error.errors[0].message })
        return
      }

      const { name, npm, email, phone, division_id, motivation, cv_url, portfolio_url, period } = validation.data

      // Cek NPM duplikat
      const existing = await prisma.applicant.findFirst({ where: { OR: [{ npm }, { email }] } })
      if (existing) {
        res.status(409).json({ status: "error", message: "NPM atau Email sudah terdaftar." })
        return
      }

      // Resolve division UUID (in case frontend sends division name instead of UUID)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(division_id)
      const division = await prisma.division.findFirst({
        where: isUuid ? { id: division_id } : { name: division_id },
      })

      if (!division) {
        res.status(400).json({ status: "error", message: "Divisi tidak valid atau tidak ditemukan." })
        return
      }

      // Tentukan periode aktif
      let targetPeriod = period
      if (!targetPeriod) {
        const activeRecPeriod = await prisma.recruitmentPeriod.findFirst({ where: { is_active: true } })
        targetPeriod = activeRecPeriod?.period || "2026/2027"
      }

      await prisma.applicant.create({
        data: {
          name,
          npm,
          email,
          phone: phone || null,
          division_id: division.id,
          motivation,
          cv_url: cv_url?.trim() || null,
          portfolio_url: portfolio_url?.trim() || null,
          period: targetPeriod,
        },
      })

      res.status(201).json({ status: "success", message: "Pendaftaran berhasil dikumpulkan." })
    } catch (error: any) {
      if (error.code === "P2002") {
        res.status(409).json({ status: "error", message: "NPM atau Email sudah terdaftar." })
        return
      }
      throw error
    }
  }

  public getApplicants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, status, period, page: pageStr } = req.query
      const page = parseInt(pageStr as string) || 1
      const limit = 20
      const skip = (page - 1) * limit

      const where: any = {}
      if (status) where.status = status
      if (period && period !== "all") where.period = period
      if (search) {
        where.OR = [{ name: { contains: search as string, mode: "insensitive" } }, { npm: { contains: search as string, mode: "insensitive" } }]
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
      ])

      // Ambil hasil wawancara yang cocok dengan nama pendaftar
      const applicantNames = applicants.map((a) => a.name)
      const interviewResponses = await prisma.interviewResponse.findMany({
        where: {
          candidate_name: { in: applicantNames },
        },
        orderBy: { created_at: "desc" },
      })

      const applicantsWithInterview = applicants.map((applicant) => {
        const interview = interviewResponses.find((ir) => ir.candidate_name.toLowerCase().trim() === applicant.name.toLowerCase().trim())
        return {
          ...applicant,
          interview_result: interview || null,
        }
      })

      res.status(200).json({
        status: "success",
        data: applicantsWithInterview,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    } catch (error) {
      next(error)
    }
  }

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const { status, admin_note } = req.body
      const reviewerId = (req as any).user?.id

      const applicant = await prisma.applicant.update({
        where: { id },
        data: {
          status,
          admin_note,
          reviewed_by: reviewerId || null,
        },
      })

      if (status === "accepted") {
        // Otomatis parsing 2 digit pertama NIM menjadi tahun angkatan mahasiswa (contoh: '24...' -> 2024)
        let angkatan = new Date().getFullYear()
        if (applicant.npm && applicant.npm.length >= 2) {
          const prefix = applicant.npm.substring(0, 2)
          const parsedPrefix = parseInt(prefix, 10)
          if (!isNaN(parsedPrefix) && parsedPrefix >= 10 && parsedPrefix <= 99) {
            angkatan = 2000 + parsedPrefix
          }
        }
        const tahunMasukMdptv = new Date().getFullYear()

        const existingMember = await prisma.member.findFirst({
          where: {
            OR: [{ npm: applicant.npm }, { full_name: applicant.name }],
          },
        })

        if (!existingMember) {
          await prisma.member.create({
            data: {
              full_name: applicant.name,
              npm: applicant.npm,
              email: applicant.email,
              phone: applicant.phone,
              division_id: applicant.division_id,
              angkatan,
              tahun_masuk: tahunMasukMdptv,
              is_core: false,
              is_active: true,
            },
          })
        } else {
          await prisma.member.update({
            where: { id: existingMember.id },
            data: {
              is_active: true,
              division_id: applicant.division_id,
              npm: applicant.npm,
              email: applicant.email,
              phone: applicant.phone,
              angkatan: existingMember.angkatan || angkatan,
              tahun_masuk: existingMember.tahun_masuk || tahunMasukMdptv,
            },
          })
        }
      } else {
        // Jika status diubah kembali dari "accepted" ke "pending", "interview", atau "rejected"
        // Hapus data member dan absensinya agar hilang dari Rekap Absensi & Data Anggota
        const targetMembers = await prisma.member.findMany({
          where: {
            OR: [{ npm: applicant.npm }, { full_name: applicant.name }],
          },
        })

        for (const m of targetMembers) {
          await prisma.attendanceRecord.deleteMany({ where: { member_id: m.id } })
          await prisma.member.delete({ where: { id: m.id } })
        }
      }

      res.status(200).json({ status: "success", message: `Status pendaftar berhasil diubah ke ${status}.` })
    } catch (error) {
      next(error)
    }
  }

  public getAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const setting = await prisma.siteSetting.findUnique({
        where: { key: "announcement_open" },
      })

      const settingVal = setting?.value as any
      const isOpen = settingVal ? settingVal.isOpen === true || settingVal === true : false
      const period = settingVal?.period || "2026/2027"

      if (!isOpen) {
        res.status(200).json({ status: "success", data: { isOpen: false, period, accepted: [] } })
        return
      }

      const accepted = await prisma.applicant.findMany({
        where: {
          status: "accepted",
          ...(period && period !== "all" ? { period } : {}),
        },
        include: { division: true },
        orderBy: { name: "asc" },
      })

      // Filter only safe fields to public interface
      const sanitized = accepted.map((a: any) => ({
        name: a.name,
        divisionName: a.division?.name || "",
        npm: a.npm.substring(0, 4) + "****", // Mask sensitive part of NIM just to be safe
        period: a.period,
      }))

      res.status(200).json({
        status: "success",
        data: {
          isOpen: true,
          period,
          accepted: sanitized,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  public toggleAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isOpen, period } = req.body

      if (typeof isOpen !== "boolean") {
        res.status(400).json({ status: "error", message: "Parameter isOpen harus berupa boolean." })
        return
      }

      const currentSetting = await prisma.siteSetting.findUnique({ where: { key: "announcement_open" } })
      const currentVal = (currentSetting?.value as any) || {}

      const updatedVal = {
        isOpen,
        period: period || currentVal.period || "2026/2027",
      }

      const updated = await prisma.siteSetting.upsert({
        where: { key: "announcement_open" },
        update: { value: updatedVal },
        create: { key: "announcement_open", value: updatedVal },
      })

      res.status(200).json({
        status: "success",
        message: isOpen ? `Pengumuman periode ${updatedVal.period} berhasil dibuka.` : "Pengumuman berhasil ditutup.",
        data: updated.value,
      })
    } catch (error) {
      next(error)
    }
  }

  // ==========================================
  // PERIODE PENERIMAAN ANGGOTA (RECRUITMENT PERIODS)
  // ==========================================
  public getPeriods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let periods = await prisma.recruitmentPeriod.findMany({
        orderBy: { period: "desc" },
      })

      if (periods.length === 0) {
        await prisma.recruitmentPeriod.createMany({
          data: [
            { period: "2026/2027", title: "Penerimaan 2026/2027", is_active: true },
            { period: "2025/2026", title: "Penerimaan 2025/2026", is_active: false },
          ],
          skipDuplicates: true,
        })
        periods = await prisma.recruitmentPeriod.findMany({
          orderBy: { period: "desc" },
        })
      }

      const appPeriods = await prisma.applicant.findMany({
        select: { period: true },
        distinct: ["period"],
      })

      const periodSet = new Set<string>(periods.map((p) => p.period))
      appPeriods.forEach((a) => {
        if (a.period) periodSet.add(a.period)
      })

      const list = Array.from(periodSet).sort().reverse()
      const activePeriod = periods.find((p) => p.is_active)?.period || list[0] || "2026/2027"

      // Site setting announcement period
      const annSetting = await prisma.siteSetting.findUnique({ where: { key: "announcement_open" } })
      const announcementPeriod = (annSetting?.value as any)?.period || activePeriod

      res.status(200).json({
        status: "success",
        data: {
          periods: list,
          activePeriod,
          announcementPeriod,
          details: periods,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  public createPeriod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { period, title, is_active } = req.body
      if (!period || typeof period !== "string" || !period.trim()) {
        res.status(400).json({ status: "error", message: "Nama periode wajib diisi (contoh: 2026/2027)." })
        return
      }

      const cleanPeriod = period.trim()

      if (is_active) {
        await prisma.recruitmentPeriod.updateMany({
          data: { is_active: false },
        })
      }

      const created = await prisma.recruitmentPeriod.upsert({
        where: { period: cleanPeriod },
        update: {
          title: title || `Penerimaan ${cleanPeriod}`,
          ...(is_active !== undefined ? { is_active: Boolean(is_active) } : {}),
        },
        create: {
          period: cleanPeriod,
          title: title || `Penerimaan ${cleanPeriod}`,
          is_active: is_active ?? false,
        },
      })

      res.status(201).json({ status: "success", data: created })
    } catch (error) {
      next(error)
    }
  }

  public setActivePeriod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { period } = req.body
      if (!period) {
        res.status(400).json({ status: "error", message: "Periode wajib ditentukan." })
        return
      }

      await prisma.$transaction([
        prisma.recruitmentPeriod.updateMany({ data: { is_active: false } }),
        prisma.recruitmentPeriod.upsert({
          where: { period },
          update: { is_active: true },
          create: { period, title: `Penerimaan ${period}`, is_active: true },
        }),
      ])

      res.status(200).json({ status: "success", message: `Periode aktif diubah ke ${period}` })
    } catch (error) {
      next(error)
    }
  }

  public deletePeriod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { period } = req.params
      await prisma.recruitmentPeriod.deleteMany({ where: { period } })
      res.status(200).json({ status: "success", message: `Periode ${period} berhasil dihapus.` })
    } catch (error) {
      next(error)
    }
  }

  // ==========================================
  // FITUR BARU: WHATSAPP GROUP LINK
  // ==========================================
  public getWhatsAppLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const setting = await prisma.siteSetting.findUnique({
        where: { key: "whatsapp_group_link" },
      })

      const link = setting ? (setting.value as any)?.link || "" : ""

      res.status(200).json({ status: "success", data: link })
    } catch (error) {
      next(error)
    }
  }

  public updateWhatsAppLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { link } = req.body

      if (typeof link !== "string") {
        res.status(400).json({ status: "error", message: "Parameter link wajib diisi dan harus berupa string." })
        return
      }

      const updated = await prisma.siteSetting.upsert({
        where: { key: "whatsapp_group_link" },
        update: { value: { link } },
        create: { key: "whatsapp_group_link", value: { link } },
      })

      res.status(200).json({
        status: "success",
        message: "Link WhatsApp berhasil diperbarui.",
        data: (updated.value as any)?.link,
      })
    } catch (error) {
      next(error)
    }
  }

  public deleteApplicant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      const applicant = await prisma.applicant.findUnique({
        where: { id },
      })

      if (!applicant) {
        res.status(404).json({ status: "error", message: "Data pendaftar tidak ditemukan." })
        return
      }

      // Jika pendaftar sudah accepted dan ada di tabel member, hapus juga member & absensinya
      const targetMembers = await prisma.member.findMany({
        where: {
          OR: [{ npm: applicant.npm }, { full_name: applicant.name }],
        },
      })

      for (const m of targetMembers) {
        await prisma.attendanceRecord.deleteMany({ where: { member_id: m.id } })
        await prisma.member.delete({ where: { id: m.id } })
      }

      await prisma.applicant.delete({
        where: { id },
      })

      res.status(200).json({ status: "success", message: "Data pendaftar berhasil dihapus." })
    } catch (error) {
      next(error)
    }
  }
}
