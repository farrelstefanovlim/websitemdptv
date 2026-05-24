import { Router, Request, Response, NextFunction } from "express";
import { UploadController, upload } from "../controllers/UploadController";
import { authMiddleware } from "../middlewares/authMiddleware";
import multer from "multer";

export function createUploadRoutes(uploadController: UploadController): Router {
  const router = Router();

  const handleUpload = (req: Request, res: Response, next: NextFunction) => {
    const uploadSingle = upload.single("file");
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ status: "error", message: "Ukuran file terlalu besar. Maksimal 20MB." });
          return;
        }
        res.status(400).json({ status: "error", message: err.message });
        return;
      } else if (err) {
        res.status(400).json({ status: "error", message: err.message });
        return;
      }
      next();
    });
  };

  // Protected — hanya admin/superadmin yang bisa upload
  router.post("/", authMiddleware, handleUpload, uploadController.uploadImage);

  return router;
}
