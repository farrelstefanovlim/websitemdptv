import prisma from "@infrastructure/database/prismaClient";

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
    
    const divisionsData = await prisma.division.findMany({
      select: {
        name: true,
        _count: {
          select: { members: { where: { is_active: true } } }
        }
      }
    });

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

    return {
      users: usersData.map(u => ({ role: u.role, count: u._count._all })),
      members: {
        total: totalMembers,
        byDivision: divisionsData.map(d => ({ name: d.name, count: d._count.members }))
      },
      applicants: {
        total: applicantsData.reduce((acc, curr) => acc + curr._count._all, 0),
        byStatus: applicantsData.map(a => ({ status: a.status, count: a._count._all }))
      },
      kegiatan: {
        total: totalKegiatan
      },
      attendance: {
        todayTotal: attendancesData.reduce((acc, curr) => acc + curr._count._all, 0),
        byStatus: attendancesData.map(a => ({ status: a.status, count: a._count._all }))
      }
    };
  }
}
