import { Request, Response } from "express";
import prisma from "@infrastructure/database/prismaClient";

export class InterviewController {
  // GET /api/v1/wawancara/years - Mendapatkan daftar tahun dokumentasi
  async getYears(req: Request, res: Response) {
    try {
      let periods = await prisma.interviewPeriod.findMany({
        orderBy: { year: "desc" },
      });

      // Seed default 2026 & 2027 if DB is empty
      if (periods.length === 0) {
        await prisma.interviewPeriod.createMany({
          data: [
            { year: 2026, title: "Wawancara 2026" },
            { year: 2027, title: "Wawancara 2027" },
          ],
          skipDuplicates: true,
        });
        periods = await prisma.interviewPeriod.findMany({
          orderBy: { year: "desc" },
        });
      }

      // Pastikan jika ada pertanyaan/jawaban di tahun lain, tahun tersebut tetap muncul
      const questionsYears = await prisma.interviewQuestion.findMany({
        select: { year_period: true },
        distinct: ["year_period"],
      });
      const responsesYears = await prisma.interviewResponse.findMany({
        select: { year_period: true },
        distinct: ["year_period"],
      });

      const dbYearsSet = new Set<number>(periods.map((p: any) => p.year));
      questionsYears.forEach((q: any) => dbYearsSet.add(q.year_period));
      responsesYears.forEach((r: any) => dbYearsSet.add(r.year_period));

      const sortedYears = Array.from(dbYearsSet).sort((a, b) => b - a);

      res.json({ success: true, data: sortedYears });
    } catch (error: any) {
      console.error("[InterviewController.getYears] Error:", error);
      res.status(500).json({ success: false, message: "Gagal mengambil daftar tahun wawancara" });
    }
  }

  // POST /api/v1/wawancara/years - Tambah/simpan periode tahun baru
  async createYear(req: Request, res: Response) {
    try {
      const { year, title } = req.body;
      const parsedYear = parseInt(year);

      if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
        return res.status(400).json({ success: false, message: "Tahun tidak valid." });
      }

      const created = await prisma.interviewPeriod.upsert({
        where: { year: parsedYear },
        update: {
          title: title || `Wawancara ${parsedYear}`,
        },
        create: {
          year: parsedYear,
          title: title || `Wawancara ${parsedYear}`,
        },
      });

      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      console.error("[InterviewController.createYear] Error:", error);
      res.status(500).json({ success: false, message: "Gagal membuat periode tahun baru" });
    }
  }

  // DELETE /api/v1/wawancara/years/:year - Hapus 1 periode tahun (beserta pertanyaan & log jawabannya)
  async deleteYear(req: Request, res: Response) {
    try {
      const year = parseInt(req.params.year);
      if (isNaN(year)) {
        return res.status(400).json({ success: false, message: "Tahun tidak valid." });
      }

      await prisma.interviewQuestion.deleteMany({ where: { year_period: year } });
      await prisma.interviewResponse.deleteMany({ where: { year_period: year } });
      await prisma.interviewPeriod.deleteMany({ where: { year } });

      res.json({ success: true, message: `Periode log tahun ${year} beserta pertanyaan & log jawabannya berhasil dihapus.` });
    } catch (error: any) {
      console.error("[InterviewController.deleteYear] Error:", error);
      res.status(500).json({ success: false, message: "Gagal menghapus periode tahun" });
    }
  }

  // GET /api/v1/wawancara/questions?year=2026
  async getQuestions(req: Request, res: Response) {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      const questions = await prisma.interviewQuestion.findMany({
        where: { year_period: year },
        orderBy: [{ order: "asc" }, { created_at: "asc" }],
      });

      res.json({ success: true, year, data: questions });
    } catch (error: any) {
      console.error("[InterviewController.getQuestions] Error:", error);
      res.status(500).json({ success: false, message: "Gagal mengambil daftar pertanyaan wawancara" });
    }
  }

  // POST /api/v1/wawancara/questions - Tambah pertanyaan baru
  async createQuestion(req: Request, res: Response) {
    try {
      const { year_period, question_text, type, options, order } = req.body;

      if (!question_text || !type) {
        return res.status(400).json({ success: false, message: "Teks pertanyaan dan tipe wajib diisi." });
      }

      const targetYear = parseInt(year_period) || new Date().getFullYear();

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
      const { question_text, type, options, order, year_period } = req.body;

      const updated = await prisma.interviewQuestion.update({
        where: { id },
        data: {
          ...(question_text && { question_text }),
          ...(type && { type: type.toUpperCase() === "MULTIPLE_CHOICE" ? "MULTIPLE_CHOICE" : "ESSAY" }),
          ...(options !== undefined && { options }),
          ...(order !== undefined && { order: parseInt(order) }),
          ...(year_period && { year_period: parseInt(year_period) }),
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

  // GET /api/v1/wawancara/responses?year=2026 - Mengambil log jawaban wawancara
  async getResponses(req: Request, res: Response) {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      const responses = await prisma.interviewResponse.findMany({
        where: { year_period: year },
        orderBy: [{ interview_date: "desc" }, { created_at: "desc" }],
      });

      res.json({ success: true, year, data: responses });
    } catch (error: any) {
      console.error("[InterviewController.getResponses] Error:", error);
      res.status(500).json({ success: false, message: "Gagal memuat log wawancara" });
    }
  }

  // POST /api/v1/wawancara/responses - Simpan hasil wawancara kandidat
  async submitResponse(req: Request, res: Response) {
    try {
      const { year_period, candidate_name, interviewer_name, answers, notes, interview_date } = req.body;

      if (!candidate_name || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ success: false, message: "Nama anggota dan jawaban wajib diisi." });
      }

      const user = (req as any).user;
      const defaultInterviewer = interviewer_name || (user ? user.full_name || user.username : "Pewawancara");
      const targetYear = parseInt(year_period) || new Date().getFullYear();

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
