import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import rateLimit from "express-rate-limit";

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  // Rate limit ketat untuk auth (5 req/menit per IP)
  const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: "Terlalu banyak percobaan login, coba lagi nanti.",
  });

  router.post("/login", authLimiter, authController.login);
  router.post("/refresh", authController.refresh);
  router.post("/logout", authController.logout);

  return router;
}
