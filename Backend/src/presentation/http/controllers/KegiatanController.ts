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
        include: { division: true, proposal_file: true, pic: true },
        orderBy: { event_date: "desc" },
      });

      res.status(200).json({ status: "success", data: kegiatans });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, description, division_id, event_date, location, budget, pic, pic_name, status, notes } = req.body;
      const userId = (req as any).user?.id;

      const kegiatan = await prisma.kegiatan.create({
        data: {
          title,
          description: description || null,
          division_id: division_id || null,
          event_date: new Date(event_date),
          location: location || null,
          budget: budget || null,
          pic_id: userId || null,
          pic_name: pic || pic_name || null,
          status: status || "draft",
          notes: notes || null,
        },
        include: { division: true, proposal_file: true, pic: true }
      });

      res.status(201).json({ status: "success", data: kegiatan, message: "Kegiatan berhasil dibuat." });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, division_id, event_date, location, budget, pic, pic_name, status, notes } = req.body;

      const updated = await prisma.kegiatan.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(division_id !== undefined && { division_id: division_id || null }),
          ...(event_date !== undefined && { event_date: new Date(event_date) }),
          ...(location !== undefined && { location }),
          ...(budget !== undefined && { budget }),
          ...((pic !== undefined || pic_name !== undefined) && { pic_name: pic || pic_name || null }),
          ...(status !== undefined && { status }),
          ...(notes !== undefined && { notes }),
        },
        include: { division: true, proposal_file: true, pic: true }
      });

      res.status(200).json({ status: "success", data: updated, message: "Kegiatan berhasil diperbarui." });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      await prisma.proposalFile.deleteMany({
        where: { kegiatan_id: id }
      });

      await prisma.kegiatan.delete({
        where: { id }
      });

      res.status(200).json({ status: "success", message: "Kegiatan berhasil dihapus." });
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
