import { Request, Response, NextFunction } from "express";
import { DomainException } from "@domain/exceptions/DomainException";
import { env } from "@infrastructure/config/env";

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Tangani DomainException (Aturan Bisnis dilanggar)
  if (error instanceof DomainException) {
    res.status(400).json({
      success: false,
      error: "DomainValidationError",
      message: error.message,
    });
    return;
  }

  // 2. Tangani Zod Validation Error (jika ada)
  if (error.name === "ZodError" || (error as any).issues) {
    res.status(400).json({
      success: false,
      error: "RequestValidationError",
      message: "Data input tidak valid.",
      details: (error as any).issues || error.message,
    });
    return;
  }

  // 3. Tangani Error Sistem Tak Terduga (500)
  console.error("🔥 Internal Server Error:", error);
  
  res.status(500).json({
    success: false,
    error: "InternalServerError",
    message: "Terjadi kesalahan internal pada server.",
    ...(env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  });
}
