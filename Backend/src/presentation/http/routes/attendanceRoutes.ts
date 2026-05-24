import { Router } from "express";
import { AttendanceController } from "../controllers/AttendanceController";
import { authMiddleware } from "../middlewares/authMiddleware";

export function createAttendanceRoutes(attendanceController: AttendanceController): Router {
  const router = Router();

  router.post("/", authMiddleware, attendanceController.checkIn);
  router.get("/", authMiddleware, attendanceController.getHistory);

  return router;
}
