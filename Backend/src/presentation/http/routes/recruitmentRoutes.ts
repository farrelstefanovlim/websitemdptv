import { Router } from "express";
import { RecruitmentController } from "../controllers/RecruitmentController";
import { authMiddleware } from "../middlewares/authMiddleware";
import rateLimit from "express-rate-limit";

export function createRecruitmentRoutes(recruitmentController: RecruitmentController): Router {
  const router = Router();

  // Rate limit ketat untuk pendaftaran (3 req/15menit per IP)
  const applyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: "Terlalu banyak pendaftaran dari IP ini, coba lagi nanti.",
  });

  // Public
  router.post("/apply", applyLimiter, recruitmentController.apply);
  router.get("/announcement", recruitmentController.getAnnouncement);
  router.get("/periods", recruitmentController.getPeriods);

  // Endpoint: Mengambil link WhatsApp di halaman RegistrationSuccess
  router.get("/whatsapp-link", recruitmentController.getWhatsAppLink);

  // Protected (Admin/Superadmin)
  router.patch("/announcement/toggle", authMiddleware, recruitmentController.toggleAnnouncement);
  router.get("/applicants", authMiddleware, recruitmentController.getApplicants);
  router.patch("/applicants/:id/status", authMiddleware, recruitmentController.updateStatus);
  router.delete("/applicants/:id", authMiddleware, recruitmentController.deleteApplicant);

  // Periode Penerimaan
  router.post("/periods", authMiddleware, recruitmentController.createPeriod);
  router.patch("/periods/active", authMiddleware, recruitmentController.setActivePeriod);
  router.delete("/periods/:period", authMiddleware, recruitmentController.deletePeriod);

  // Admin menyimpan link WhatsApp dari dashboard
  router.put("/whatsapp-link", authMiddleware, recruitmentController.updateWhatsAppLink);
  
  return router;
}
