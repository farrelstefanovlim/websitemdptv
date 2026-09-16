import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { ImageKitService } from "@infrastructure/services/ImageKitService";

const storage = multer.memoryStorage();

// Filter: hanya gambar
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format file tidak didukung. Gunakan JPEG, PNG, WebP, GIF, atau SVG."));
  }
};

// Filter: Foto & PDF untuk CV/Resume/Foto
const cvFileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (allowed.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error("Format berkas tidak didukung. Gunakan PDF, JPG, PNG, atau WebP."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // Max 20MB
});

export const uploadCv = multer({
  storage,
  fileFilter: cvFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
});

export class UploadController {
  private imageKitService: ImageKitService;

  constructor(imageKitService?: ImageKitService) {
    this.imageKitService = imageKitService || new ImageKitService();
  }

  public uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ status: "error", message: "Tidak ada file yang diupload." });
        return;
      }

      const ext = path.extname(req.file.originalname) || ".jpg";
      const uniqueName = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;

      const uploadResult = await this.imageKitService.upload({
        file: req.file.buffer,
        fileName: uniqueName,
        folder: "/mdptv",
      });

      res.status(200).json({
        status: "success",
        data: {
          url: uploadResult.url,
          filename: uploadResult.name,
          fileId: uploadResult.fileId,
          originalName: req.file.originalname,
          size: uploadResult.size || req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public uploadCvFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ status: "error", message: "Tidak ada berkas yang diunggah." });
        return;
      }

      const ext = path.extname(req.file.originalname) || (req.file.mimetype === "application/pdf" ? ".pdf" : ".jpg");
      const cleanOriginalName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueName = `cv_${Date.now()}_${cleanOriginalName}`;

      const uploadResult = await this.imageKitService.upload({
        file: req.file.buffer,
        fileName: uniqueName,
        folder: "/mdptv/applicants/cv",
      });

      res.status(200).json({
        status: "success",
        data: {
          url: uploadResult.url,
          filename: uploadResult.name,
          fileId: uploadResult.fileId,
          originalName: req.file.originalname,
          size: uploadResult.size || req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
