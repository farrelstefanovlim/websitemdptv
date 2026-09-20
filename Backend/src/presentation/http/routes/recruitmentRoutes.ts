import { Router, Request, Response, NextFunction } from "express"
import { RecruitmentController } from "../controllers/RecruitmentController"
import { UploadController, uploadCv } from "../controllers/UploadController"
import { authMiddleware } from "../middlewares/authMiddleware"
import rateLimit from "express-rate-limit"
import multer from "multer"

export function createRecruitmentRoutes(recruitmentController: RecruitmentController, uploadController?: UploadController): Router {
  const router = Router()

  // Rate limit ketat untuk pendaftaran (3 req/15menit per IP)
  const applyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: "Terlalu banyak pendaftaran dari IP ini, coba lagi nanti.",
  })

  const handleCvUpload = (req: Request, res: Response, next: NextFunction) => {
    const uploadSingle = uploadCv.single("file")
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ status: "error", message: "Ukuran berkas terlalu besar. Maksimal 10MB." })
          return
        }
        res.status(400).json({ status: "error", message: err.message })
        return
      } else if (err) {
        res.status(400).json({ status: "error", message: err.message })
        return
      }
      next()
    })
  }

  // Public — Upload CV / Foto untuk formulir pendaftaran
  if (uploadController) {
    router.post("/upload", handleCvUpload, uploadController.uploadCvFile)
  }

  // Public
  router.post("/apply", applyLimiter, recruitmentController.apply)
  router.get("/announcement", recruitmentController.getAnnouncement)
  router.get("/periods", recruitmentController.getPeriods)

  // Endpoint: Mengambil link WhatsApp di halaman RegistrationSuccess
  router.get("/whatsapp-link", recruitmentController.getWhatsAppLink)

  // Protected (Admin/Superadmin)
  router.patch("/announcement/toggle", authMiddleware, recruitmentController.toggleAnnouncement)
  router.get("/applicants", authMiddleware, recruitmentController.getApplicants)
  router.patch("/applicants/:id/status", authMiddleware, recruitmentController.updateStatus)
  router.delete("/applicants/:id", authMiddleware, recruitmentController.deleteApplicant)

  // Periode Penerimaan
  router.post("/periods", authMiddleware, recruitmentController.createPeriod)
  router.patch("/periods/active", authMiddleware, recruitmentController.setActivePeriod)
  router.delete("/periods/:period", authMiddleware, recruitmentController.deletePeriod)

  // Admin menyimpan link WhatsApp dari dashboard
  router.put("/whatsapp-link", authMiddleware, recruitmentController.updateWhatsAppLink)

  return router
}
