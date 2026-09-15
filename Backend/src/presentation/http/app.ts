import express, { Express } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { createApiRouter, AppControllers } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

export function createExpressApp(controllers: AppControllers): Express {
  const app = express();

  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Helmet - Proteksi Web Vulnerability Standard
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Middleware bawaan
  app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }));
  app.use(express.json({ limit: "10mb" }));
  app.use(cookieParser());

  // Serve uploaded files statically
  app.use("/uploads", express.static(uploadsDir));

  // Rate limiting (Global)
  const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 menit
    max: 100, // 100 req per IP
    message: "Terlalu banyak permintaan dari IP ini, coba lagi nanti.",
  });
  app.use(globalLimiter);

  // Registrasikan router utama dengan prefix /api/v1
  app.use("/api/v1", createApiRouter(controllers));

  // Tangani Endpoint yang tidak ditemukan (404)
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: "NotFound",
      message: "Endpoint yang Anda cari tidak ditemukan.",
    });
  });

  // Global Error Handler (harus diletakkan di paling akhir)
  app.use(errorHandler);

  return app;
}
