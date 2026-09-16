import prisma from "@infrastructure/database/prismaClient";

export class DivisionSyncService {
  public static async syncFromCmsContent(divisionsList?: any[]): Promise<void> {
    try {
      let list = divisionsList;

      // If not passed, try to load from section_contents
      if (!list) {
        const sectionContent = await prisma.sectionContent.findUnique({
          where: { section_key: "divisions" },
        });
        if (sectionContent && sectionContent.content && typeof sectionContent.content === "object") {
          list = (sectionContent.content as any).divisions;
        }
      }

      if (!Array.isArray(list) || list.length === 0) return;

      const validDivisions = list
        .map((item: any, idx: number) => ({
          name: (item.title || item.name || "").trim(),
          subtitle: item.subtitle?.trim() || null,
          description: item.description?.trim() || null,
          image_url: item.image?.trim() || item.image_url?.trim() || null,
          features: Array.isArray(item.features) ? item.features : [],
          order: idx + 1,
        }))
        .filter((item) => item.name.length > 0);

      if (validDivisions.length === 0) return;

      const validNames = validDivisions.map((d) => d.name);

      for (const div of validDivisions) {
        await prisma.division.upsert({
          where: { name: div.name },
          update: {
            subtitle: div.subtitle,
            description: div.description,
            image_url: div.image_url,
            features: div.features,
            order: div.order,
          },
          create: {
            name: div.name,
            subtitle: div.subtitle,
            description: div.description,
            image_url: div.image_url,
            features: div.features,
            order: div.order,
          },
        });
      }

      // Safe cleanup for removed divisions with no foreign relations
      const existingDbDivisions = await prisma.division.findMany({
        include: {
          _count: {
            select: {
              members: true,
              applicants: true,
              users: true,
              kegiatans: true,
            },
          },
        },
      });

      for (const dbDiv of existingDbDivisions) {
        if (!validNames.includes(dbDiv.name)) {
          const hasRelations =
            dbDiv._count.members > 0 ||
            dbDiv._count.applicants > 0 ||
            dbDiv._count.users > 0 ||
            dbDiv._count.kegiatans > 0;

          if (!hasRelations) {
            await prisma.division.delete({
              where: { id: dbDiv.id },
            });
          }
        }
      }
    } catch (error) {
      console.error("[DivisionSyncService] Error syncing divisions:", error);
    }
  }
}
