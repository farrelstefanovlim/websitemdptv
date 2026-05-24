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

  // Protected (Admin/Superadmin)
  router.get("/applicants", authMiddleware, recruitmentController.getApplicants);
  router.patch("/applicants/:id/status", authMiddleware, recruitmentController.updateStatus);

  return router;
}
