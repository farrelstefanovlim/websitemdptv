import { Request, Response } from "express";
import prisma from "@infrastructure/database/prismaClient";

function parsePeriodToYear(val: any): number {
  if (!val) return new Date().getFullYear();
  if (typeof val === "number") return val;
  const str = String(val).trim();
  const parsed = parseInt(str.split("/")[0], 10);
  return isNaN(parsed) ? new Date().getFullYear() : parsed;
}

export class InterviewController {
  // GET /api/v1/wawancara/years - Mendapatkan daftar periode sinkron dengan recruitment_periods
  async getYears(req: Request, res: Response) {
    try {
      let recPeriods = await prisma.recruitmentPeriod.findMany({
        orderBy: { period: "desc" },
      });

      // Default seed if empty
      if (recPeriods.length === 0) {
        await prisma.recruitmentPeriod.createMany({
          data: [
            { period: "2026/2027", title: "Penerimaan 2026/2027", is_active: true },
            { period: "2025/2026", title: "Penerimaan 2025/2026", is_active: false },
          ],
          skipDuplicates: true,
        });
        recPeriods = await prisma.recruitmentPeriod.findMany({
          orderBy: { period: "desc" },
        });
      }

      // Ambil juga jika ada applicant yang punya periode lain
      const appPeriods = await prisma.applicant.findMany({
        select: { period: true },
        distinct: ["period"],
      });

      const periodSet = new Set<string>(recPeriods.map((p) => p.period));
      appPeriods.forEach((a) => {
        if (a.period) periodSet.add(a.period);
      });

      const sortedPeriods = Array.from(periodSet).sort((a, b) => b.localeCompare(a));

      res.json({ success: true, data: sortedPeriods });
    } catch (error: any) {
      console.error("[InterviewController.getYears] Error:", error);
      res.status(500).json({ success: false, message: "Gagal mengambil daftar periode wawancara" });
    }
  }

  // POST /api/v1/wawancara/years - Tambah periode baru
  async createYear(req: Request, res: Response) {
    try {
      const { year, period, title } = req.body;
      const targetPeriod = (period || year || "").toString().trim();

      if (!targetPeriod) {
        return res.status(400).json({ success: false, message: "Periode tidak valid." });
      }

      const created = await prisma.recruitmentPeriod.upsert({
        where: { period: targetPeriod },
        update: {
          title: title || `Periode ${targetPeriod}`,
        },
        create: {
          period: targetPeriod,
          title: title || `Periode ${targetPeriod}`,
          is_active: false,
        },
      });

      const yearNum = parsePeriodToYear(targetPeriod);
      await prisma.interviewPeriod.upsert({
        where: { year: yearNum },
        update: { title: title || `Wawancara ${yearNum}` },
        create: { year: yearNum, title: title || `Wawancara ${yearNum}` },
      });

      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      console.error("[InterviewController.createYear] Error:", error);
      res.status(500).json({ success: false, message: "Gagal membuat periode baru" });
    }
  }

  // DELETE /api/v1/wawancara/years/:year - Hapus periode
  async deleteYear(req: Request, res: Response) {
    try {
      const paramVal = req.params.year;
      const yearNum = parsePeriodToYear(paramVal);

      await prisma.interviewQuestion.deleteMany({ where: { year_period: yearNum } });
      await prisma.interviewResponse.deleteMany({ where: { year_period: yearNum } });
      await prisma.interviewPeriod.deleteMany({ where: { year: yearNum } });

      res.json({ success: true, message: `Periode ${paramVal} berhasil dihapus.` });
    } catch (error: any) {
      console.error("[InterviewController.deleteYear] Error:", error);
      res.status(500).json({ success: false, message: "Gagal menghapus periode" });
    }
  }

  // GET /api/v1/wawancara/questions?year=2026/2027
  async getQuestions(req: Request, res: Response) {
    try {
      const targetYear = parsePeriodToYear(req.query.year || req.query.period);

      const questions = await prisma.interviewQuestion.findMany({
        where: { year_period: targetYear },
        orderBy: [{ order: "asc" }, { created_at: "asc" }],
      });

      res.json({ success: true, year: targetYear, data: questions });
    } catch (error: any) {
      console.error("[InterviewController.getQuestions] Error:", error);
      res.status(500).json({ success: false, message: "Gagal mengambil daftar pertanyaan wawancara" });
    }
  }

  // POST /api/v1/wawancara/questions - Tambah pertanyaan baru
  async createQuestion(req: Request, res: Response) {
    try {
      const { year_period, period, question_text, type, options, order } = req.body;

      if (!question_text || !type) {
        return res.status(400).json({ success: false, message: "Teks pertanyaan dan tipe wajib diisi." });
      }

      const targetYear = parsePeriodToYear(year_period || period);

      // Pastikan tahun terdaftar di InterviewPeriod
      await prisma.interviewPeriod.upsert({
        where: { year: targetYear },
        update: {},
        create: { year: targetYear, title: `Wawancara ${targetYear}` },
      });

      const created = await prisma.interviewQuestion.create({
        data: {
          year_period: targetYear,
          question_text,
          type: type.toUpperCase() === "MULTIPLE_CHOICE" ? "MULTIPLE_CHOICE" : "ESSAY",
          options: options || null,
          order: parseInt(order) || 0,
        },
      });

      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      console.error("[InterviewController.createQuestion] Error:", error);
      res.status(500).json({ success: false, message: "Gagal menambahkan pertanyaan wawancara" });
    }
  }

  // PUT /api/v1/wawancara/questions/:id - Edit pertanyaan
  async updateQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { question_text, type, options, order, year_period, period } = req.body;

      const targetYear = year_period || period ? parsePeriodToYear(year_period || period) : undefined;

      const updated = await prisma.interviewQuestion.update({
        where: { id },
        data: {
          ...(question_text && { question_text }),
          ...(type && { type: type.toUpperCase() === "MULTIPLE_CHOICE" ? "MULTIPLE_CHOICE" : "ESSAY" }),
          ...(options !== undefined && { options }),
          ...(order !== undefined && { order: parseInt(order) }),
          ...(targetYear && { year_period: targetYear }),
        },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Gagal memperbarui pertanyaan wawancara" });
    }
  }

  // DELETE /api/v1/wawancara/questions/:id - Hapus pertanyaan
  async deleteQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.interviewQuestion.delete({ where: { id } });
      res.json({ success: true, message: "Pertanyaan berhasil dihapus" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Gagal menghapus pertanyaan" });
    }
  }

  // GET /api/v1/wawancara/responses?year=2026/2027 - Mengambil log jawaban wawancara
  async getResponses(req: Request, res: Response) {
    try {
      const targetYear = parsePeriodToYear(req.query.year || req.query.period);

      const responses = await prisma.interviewResponse.findMany({
        where: { year_period: targetYear },
        orderBy: [{ interview_date: "desc" }, { created_at: "desc" }],
      });

      res.json({ success: true, year: targetYear, data: responses });
    } catch (error: any) {
      console.error("[InterviewController.getResponses] Error:", error);
      res.status(500).json({ success: false, message: "Gagal memuat log wawancara" });
    }
  }

  // POST /api/v1/wawancara/responses - Simpan hasil wawancara kandidat
  async submitResponse(req: Request, res: Response) {
    try {
      const { year_period, period, candidate_name, interviewer_name, answers, notes, interview_date } = req.body;

      if (!candidate_name || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ success: false, message: "Nama anggota dan jawaban wajib diisi." });
      }

      const user = (req as any).user;
      const defaultInterviewer = interviewer_name || (user ? user.full_name || user.username : "Pewawancara");
      const targetYear = parsePeriodToYear(year_period || period);

      await prisma.interviewPeriod.upsert({
        where: { year: targetYear },
        update: {},
        create: { year: targetYear, title: `Wawancara ${targetYear}` },
      });

      const created = await prisma.interviewResponse.create({
        data: {
          year_period: targetYear,
          candidate_name,
          interviewer_name: defaultInterviewer,
          interview_date: interview_date ? new Date(interview_date) : new Date(),
          answers: answers,
          notes: notes || null,
        },
      });

      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      console.error("[InterviewController.submitResponse] Error:", error);
      res.status(500).json({ success: false, message: "Gagal menyimpan jawaban wawancara" });
    }
  }

  // DELETE /api/v1/wawancara/responses/:id - Hapus 1 log wawancara
  async deleteResponse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.interviewResponse.delete({ where: { id } });
      res.json({ success: true, message: "Log wawancara berhasil dihapus" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Gagal menghapus log wawancara" });
    }
  }
}
