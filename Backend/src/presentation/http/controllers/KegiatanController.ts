import { Request, Response, NextFunction } from "express";
import prisma from "@infrastructure/database/prismaClient";

export class KegiatanController {
  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { division_id, status } = req.query;
      const where: any = {};
      if (division_id) where.division_id = division_id;
      if (status) where.status = status;

      const kegiatans = await prisma.kegiatan.findMany({
        where,
        include: { division: true, proposal_file: true },
        orderBy: { event_date: "desc" },
      });

      res.status(200).json({ status: "success", data: kegiatans });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, description, division_id, event_date, location, budget } = req.body;
      const picId = (req as any).user?.id;

      const kegiatan = await prisma.kegiatan.create({
        data: {
          title,
          description,
          division_id: division_id || null,
          event_date: new Date(event_date),
          location,
          budget,
          pic_id: picId || null,
          status: "draft",
        }
      });

      res.status(201).json({ status: "success", data: kegiatan, message: "Kegiatan berhasil dibuat." });
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      await prisma.kegiatan.update({
        where: { id },
        data: { status, notes }
      });

      res.status(200).json({ status: "success", message: `Status kegiatan berhasil diubah ke ${status}.` });
    } catch (error) {
      next(error);
    }
  };

  public uploadProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      // Placeholder: Di production, file akan diupload ke S3/Cloud Storage
      // dan hanya URL yang disimpan di database
      const { file_name, file_type, file_size, file_url } = req.body;

      await prisma.proposalFile.upsert({
        where: { kegiatan_id: id },
        update: { file_name, file_type, file_size, file_url },
        create: { kegiatan_id: id, file_name, file_type, file_size, file_url }
      });

      res.status(200).json({ status: "success", data: { file_url }, message: "Proposal berhasil diupload." });
    } catch (error) {
      next(error);
    }
  };
}
