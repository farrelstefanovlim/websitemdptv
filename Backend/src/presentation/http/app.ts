import express, { Express } from "express";
import cors from "cors";
import { createApiRouter, AppControllers } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

export function createExpressApp(controllers: AppControllers): Express {
  const app = express();

  // Middleware bawaan
  app.use(cors());
  app.use(express.json());

  // Registrasikan router utama dengan prefix /api
  app.use("/api", createApiRouter(controllers));

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
