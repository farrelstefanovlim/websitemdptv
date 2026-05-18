import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { createUserRoutes } from "./userRoutes";

export interface AppControllers {
  userController: UserController;
}

export function createApiRouter(controllers: AppControllers): Router {
  const router = Router();

  // Daftarkan routing user di prefix /users
  router.use("/users", createUserRoutes(controllers.userController));

  // Endpoint Health Check untuk verifikasi server berjalan dengan baik
  router.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
      bunVersion: Bun.version,
    });
  });

  return router;
}
