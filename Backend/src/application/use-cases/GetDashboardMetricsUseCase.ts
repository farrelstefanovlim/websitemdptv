import prisma from "@infrastructure/database/prismaClient";
import { DivisionSyncService } from "@infrastructure/services/DivisionSyncService";

export class GetDashboardMetricsUseCase {
  async execute() {
    // 1. Users grouped by role
    const usersData = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        _all: true
      }
    });

    // 2. Members & Divisions
    const totalMembers = await prisma.member.count({ where: { is_active: true } });
    
    let divisionsData = await prisma.division.findMany({
      orderBy: { order: "asc" },
      select: {
        name: true,
        _count: {
          select: { members: { where: { is_active: true } } }
        }
      }
    });

    if (divisionsData.length === 0) {
      await DivisionSyncService.syncFromCmsContent();
      divisionsData = await prisma.division.findMany({
        orderBy: { order: "asc" },
        select: {
          name: true,
          _count: {
            select: { members: { where: { is_active: true } } }
          }
        }
      });
    }

    // 3. Applicants grouped by status
    const applicantsData = await prisma.applicant.groupBy({
      by: ['status'],
      _count: {
        _all: true
      }
    });

    // 4. Total Kegiatan
    const totalKegiatan = await prisma.kegiatan.count();

    // 5. Attendance Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Instead of using exact match which could fail due to timezone, check range
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendancesData = await prisma.attendanceRecord.groupBy({
      by: ['status'],
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      _count: {
        _all: true
      }
    });

    // 6. Registration & Announcement Settings
    const regSetting = await prisma.siteSetting.findUnique({
      where: { key: "registration_open" },
    });
    const registrationOpen = regSetting ? (regSetting.value === true || (regSetting.value as any)?.isOpen === true) : true;

    // 7. Recent Items for Quick Overview
    const upcomingKegiatan = await prisma.kegiatan.findMany({
      take: 4,
      orderBy: { event_date: "desc" },
      include: { division: true },
    });

    const recentApplicants = await prisma.applicant.findMany({
      take: 4,
      orderBy: { applied_at: "desc" },
      include: { division: true },
    });

    return {
      registrationOpen,
      users: usersData.map((u: any) => ({ role: u.role, count: u._count._all })),
      members: {
        total: totalMembers,
        byDivision: divisionsData.map((d: any) => ({ name: d.name, count: d._count.members }))
      },
      applicants: {
        total: applicantsData.reduce((acc: number, curr: any) => acc + curr._count._all, 0),
        byStatus: applicantsData.map((a: any) => ({ status: a.status, count: a._count._all })),
        recent: recentApplicants.map((a: any) => ({
          id: a.id,
          name: a.name,
          nim: a.nim,
          division: a.division?.name || "Umum",
          status: a.status,
          applied_at: a.applied_at,
        })),
      },
      kegiatan: {
        total: totalKegiatan,
        upcoming: upcomingKegiatan.map((k: any) => ({
          id: k.id,
          title: k.title,
          date: k.event_date,
          location: k.location || "Lab Studio",
          status: k.status,
          division: k.division?.name || "All Division",
        })),
      },
      attendance: {
        todayTotal: attendancesData.reduce((acc: number, curr: any) => acc + curr._count._all, 0),
        byStatus: attendancesData.map((a: any) => ({ status: a.status, count: a._count._all }))
      }
    };
  }
}
