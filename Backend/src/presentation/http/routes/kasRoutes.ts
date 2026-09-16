import { Router } from "express";
import { KasController } from "../controllers/KasController";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export function createKasRoutes(kasController: KasController): Router {
  const router = Router();

  router.get("/", kasController.getAll.bind(kasController));
  router.post("/", kasController.create.bind(kasController));
  router.post("/upload", upload.single("file"), kasController.uploadExcel.bind(kasController));
  router.delete("/reset/all", kasController.deleteAll.bind(kasController));
  router.delete("/:id", kasController.delete.bind(kasController));

  // Unpaid Kas routes
  router.get("/unpaid", kasController.getUnpaid.bind(kasController));
  router.post("/unpaid", kasController.createUnpaid.bind(kasController));
  router.post("/unpaid/upload", upload.single("file"), kasController.uploadUnpaidExcel.bind(kasController));
  router.put("/unpaid/:id", kasController.updateUnpaid.bind(kasController));
  router.delete("/unpaid/:id", kasController.deleteUnpaid.bind(kasController));

  return router;
}

