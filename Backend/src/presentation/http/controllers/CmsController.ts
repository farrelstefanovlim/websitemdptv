import { Request, Response, NextFunction } from "express";
import prisma from "@infrastructure/database/prismaClient";
import { DivisionSyncService } from "@infrastructure/services/DivisionSyncService";

export class CmsController {
  public getSections = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const layouts = await prisma.layoutSection.findMany({
        orderBy: { order: "asc" },
        include: { content: true }
      });

      const sections = layouts.map((l: any) => ({
        section_key: l.section_key,
        label: l.label,
        icon: l.icon,
        visible: l.visible,
        order: l.order,
        content: l.content?.content || null
      }));

      res.status(200).json({ status: "success", data: sections });
    } catch (error) {
      next(error);
    }
  };

  public updateSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      const content = req.body;

      // Ensure LayoutSection exists before upserting SectionContent to avoid Foreign Key violations
      await prisma.layoutSection.upsert({
        where: { section_key: key },
        update: {},
        create: {
          section_key: key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          icon: "settings",
          order: 99,
          visible: true
        }
      });

      await prisma.sectionContent.upsert({
        where: { section_key: key },
        update: { content },
        create: { section_key: key, content }
      });

      // Synchronize division table when divisions section is updated
      if (key === "divisions" && content && Array.isArray(content.divisions)) {
        await DivisionSyncService.syncFromCmsContent(content.divisions);
      }

      res.status(200).json({ status: "success", message: `Section ${key} berhasil diubah.` });
    } catch (error) {
      next(error);
    }
  };

  public updateLayouts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { layouts } = req.body;
      if (!Array.isArray(layouts)) {
        res.status(400).json({ status: "error", message: "Layouts must be an array" });
        return;
      }

      await prisma.$transaction(
        layouts.map((l: any) => 
          prisma.layoutSection.update({
            where: { section_key: l.id },
            data: { order: l.order, visible: l.visible }
          })
        )
      );

      res.status(200).json({ status: "success", message: "Layout settings saved successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getGallery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const skip = (page - 1) * limit;

      const [images, total] = await Promise.all([
        prisma.galleryImage.findMany({
          orderBy: { order: "asc" },
          skip,
          take: limit,
        }),
        prisma.galleryImage.count(),
      ]);

      res.status(200).json({
        status: "success",
        data: images,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      next(error);
    }
  };
  public addGallery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { label, title, image_url, featured = false } = req.body;
      
      const newImage = await prisma.galleryImage.create({
        data: {
          label,
          title,
          image_url,
          featured,
          section_key: "documentation"
        }
      });

      res.status(201).json({ status: "success", data: newImage, message: "Foto berhasil ditambahkan" });
    } catch (error) {
      next(error);
    }
  };

  public toggleGalleryFeatured = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const current = await prisma.galleryImage.findUnique({ where: { id } });
      if (!current) {
        res.status(404).json({ status: "error", message: "Foto tidak ditemukan" });
        return;
      }
      
      const updated = await prisma.galleryImage.update({
        where: { id },
        data: { featured: !current.featured }
      });
      
      res.status(200).json({ status: "success", data: updated, message: "Status featured berhasil diubah" });
    } catch (error) {
      next(error);
    }
  };

  public deleteGallery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await prisma.galleryImage.delete({ where: { id } });
      res.status(200).json({ status: "success", message: "Foto berhasil dihapus" });
    } catch (error) {
      next(error);
    }
  };
}
