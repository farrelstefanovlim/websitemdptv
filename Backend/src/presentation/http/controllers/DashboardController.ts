import { Request, Response } from "express";
import { GetDashboardMetricsUseCase } from "@application/use-cases/GetDashboardMetricsUseCase";

export class DashboardController {
  constructor(private getDashboardMetricsUseCase: GetDashboardMetricsUseCase) {}

  getMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.getDashboardMetricsUseCase.execute();
      res.status(200).json(data);
    } catch (error: any) {
      console.error("[DashboardController] Error fetching metrics:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };
}
