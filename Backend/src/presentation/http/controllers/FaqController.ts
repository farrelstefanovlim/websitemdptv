import { Request, Response } from "express";
import prisma from "@infrastructure/database/prismaClient";

export class FaqController {
  // GET /api/v1/faqs - Ambil seluruh FAQ
  async getAll(req: Request, res: Response) {
    try {
      const { category, search } = req.query;

      const where: any = {};
      if (category && typeof category === "string" && category !== "ALL") {
        where.category = category;
      }
      if (search && typeof search === "string") {
        where.OR = [
          { question: { contains: search, mode: "insensitive" } },
          { answer: { contains: search, mode: "insensitive" } },
        ];
      }

      const faqs = await prisma.faq.findMany({
        where,
        orderBy: [{ order: "asc" }, { created_at: "desc" }],
      });

      res.json({
        success: true,
        data: faqs,
      });
    } catch (error: any) {
      console.error("[FaqController.getAll] Error:", error);
      res.status(500).json({ success: false, message: "Gagal memuat daftar FAQ" });
    }
  }

  // POST /api/v1/faqs - Buat FAQ baru
  async create(req: Request, res: Response) {
    try {
      const { question, answer, category, order, is_active } = req.body;

      if (!question || !answer) {
        return res.status(400).json({ success: false, message: "Pertanyaan dan jawaban wajib diisi." });
      }

      const created = await prisma.faq.create({
        data: {
          question: String(question).trim(),
          answer: String(answer).trim(),
          category: category ? String(category).trim() : "Umum",
          order: order ? parseInt(order) : 0,
          is_active: is_active !== undefined ? Boolean(is_active) : true,
        },
      });

      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      console.error("[FaqController.create] Error:", error);
      res.status(500).json({ success: false, message: "Gagal membuat FAQ" });
    }
  }

  // PUT /api/v1/faqs/:id - Update FAQ
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { question, answer, category, order, is_active } = req.body;

      const updated = await prisma.faq.update({
        where: { id },
        data: {
          ...(question && { question: String(question).trim() }),
          ...(answer && { answer: String(answer).trim() }),
          ...(category !== undefined && { category: category ? String(category).trim() : "Umum" }),
          ...(order !== undefined && { order: parseInt(order) }),
          ...(is_active !== undefined && { is_active: Boolean(is_active) }),
        },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      console.error("[FaqController.update] Error:", error);
      res.status(400).json({ success: false, message: "Gagal memperbarui FAQ" });
    }
  }

  // DELETE /api/v1/faqs/:id - Hapus FAQ
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.faq.delete({ where: { id } });
      res.json({ success: true, message: "FAQ berhasil dihapus" });
    } catch (error: any) {
      console.error("[FaqController.delete] Error:", error);
      res.status(400).json({ success: false, message: "Gagal menghapus FAQ" });
    }
  }
}
