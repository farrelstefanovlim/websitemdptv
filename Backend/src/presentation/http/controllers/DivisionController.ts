import { Request, Response } from "express";
import prisma from "@infrastructure/database/prismaClient";

export class DivisionController {
  async getAll(req: Request, res: Response) {
    try {
      const divisions = await prisma.division.findMany({
        orderBy: { order: "asc" }
      });
      res.json({ success: true, data: divisions });
    } catch (error) {
      console.error("[DivisionController.getAll] Error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}
