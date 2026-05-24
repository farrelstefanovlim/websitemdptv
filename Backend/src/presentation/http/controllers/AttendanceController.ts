import { Request, Response, NextFunction } from "express";
import prisma from "@infrastructure/database/prismaClient";

export class AttendanceController {
  public checkIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { member_id, status, date } = req.body;

      if (!status || !member_id) {
        res.status(400).json({ status: "error", message: "ID Anggota dan Status kehadiran wajib diisi." });
        return;
      }

      const recordDate = date ? new Date(date) : new Date(new Date().setUTCHours(0, 0, 0, 0));

      await prisma.attendanceRecord.upsert({
        where: {
          member_id_date: {
            member_id,
            date: recordDate,
          }
        },
        update: {
          status,
        },
        create: {
          member_id,
          date: recordDate,
          status,
        }
      });

      res.status(200).json({ status: "success", message: "Absensi berhasil dicatat/diperbarui." });
    } catch (error) {
      next(error);
    }
  };

  public getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = (req as any).user?.id;
      const currentUserRole = (req as any).user?.role;

      const { month, year, user_id } = req.query;
      const where: any = {};

      if (currentUserRole !== "superadmin" && currentUserRole !== "admin") {
        where.member_id = currentUserId; // Users can only see their own attendance
      } else if (user_id) {
        where.member_id = user_id; // Admins can filter by specific user
      }

      if (month && year) {
        const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
        const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);
        where.date = { gte: startDate, lte: endDate };
      }

      const records = await prisma.attendanceRecord.findMany({
        where,
        orderBy: { date: "desc" },
      });

      res.status(200).json({ status: "success", data: records });
    } catch (error) {
      next(error);
    }
  };
}
