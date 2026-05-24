import { Router } from "express";
import { KegiatanController } from "../controllers/KegiatanController";
import { authMiddleware } from "../middlewares/authMiddleware";

export function createKegiatanRoutes(kegiatanController: KegiatanController): Router {
  const router = Router();

  // Semua protected (Admin/Superadmin)
  router.get("/", authMiddleware, kegiatanController.getAll);
  router.post("/", authMiddleware, kegiatanController.create);
  router.patch("/:id/status", authMiddleware, kegiatanController.updateStatus);
  router.post("/:id/upload-proposal", authMiddleware, kegiatanController.uploadProposal);

  return router;
}
