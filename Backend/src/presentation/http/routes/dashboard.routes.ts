import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController";

export function createDashboardRoutes(dashboardController: DashboardController): Router {
  const router = Router();

  router.get("/metrics", dashboardController.getMetrics);

  return router;
}
