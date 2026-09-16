import { env } from "@infrastructure/config/env";
import { createExpressApp } from "@presentation/http/app";
import { PrismaUserRepository } from "@infrastructure/database/PrismaUserRepository";
import { BunHashService } from "@infrastructure/services/BunHashService";
import { RegisterUserUseCase } from "@application/use-cases/RegisterUserUseCase";
import { GetAllUsersUseCase } from "@application/use-cases/GetAllUsersUseCase";
import { UserController } from "@presentation/http/controllers/UserController";
import { AuthController } from "@presentation/http/controllers/AuthController";
import { CmsController } from "@presentation/http/controllers/CmsController";
import { RecruitmentController } from "@presentation/http/controllers/RecruitmentController";
import { KegiatanController } from "@presentation/http/controllers/KegiatanController";
import { AttendanceController } from "@presentation/http/controllers/AttendanceController";
import { UploadController } from "@presentation/http/controllers/UploadController";
import { MemberController } from "@presentation/http/controllers/MemberController";
import { DivisionController } from "@presentation/http/controllers/DivisionController";
import { DashboardController } from "@presentation/http/controllers/DashboardController";
import { GetDashboardMetricsUseCase } from "@application/use-cases/GetDashboardMetricsUseCase";
import { DivisionSyncService } from "@infrastructure/services/DivisionSyncService";

async function bootstrap() {
  console.log("🚀 Memulai inisialisasi server...");

  // 0. Sinkronisasi Data Divisi dari CMS jika diperlukan
  await DivisionSyncService.syncFromCmsContent();

  // 1. Inisialisasi Database / Repositories (Infrastructure Layer)
  const userRepository = new PrismaUserRepository();

  // 2. Inisialisasi Services (Infrastructure Layer)
  const hashService = new BunHashService();

  // 3. Inisialisasi Use Cases (Application Layer) dengan Dependency Injection (DI)
  const registerUserUseCase = new RegisterUserUseCase(userRepository, hashService);
  const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
  const getDashboardMetricsUseCase = new GetDashboardMetricsUseCase();

  // 4. Inisialisasi Controllers (Presentation Layer)
  const userController = new UserController(registerUserUseCase, getAllUsersUseCase);
  const authController = new AuthController();
  const cmsController = new CmsController();
  const recruitmentController = new RecruitmentController();
  const kegiatanController = new KegiatanController();
  const attendanceController = new AttendanceController();
  const uploadController = new UploadController();
  const memberController = new MemberController();
  const divisionController = new DivisionController();
  const dashboardController = new DashboardController(getDashboardMetricsUseCase);

  // 5. Inisialisasi Express App dengan Controllers
  const app = createExpressApp({
    userController,
    authController,
    cmsController,
    recruitmentController,
    kegiatanController,
    attendanceController,
    uploadController,
    memberController,
    divisionController,
    dashboardController,
  });

  // 6. Jalankan Server
  app.listen(env.PORT, () => {
    const runtimeVersion = typeof Bun !== "undefined" ? `Bun v${Bun.version}` : `Node.js ${process.version}`;
    console.log(`\n======================================================`);
    console.log(`✨ Server berhasil berjalan di Port: ${env.PORT}`);
    console.log(`🚀 Lingkungan: ${env.NODE_ENV}`);
    console.log(`⚡ Runtime: ${runtimeVersion}`);
    console.log(`👉 Cek Kesehatan: http://localhost:${env.PORT}/api/v1/health`);
    console.log(`======================================================\n`);
  });
}

bootstrap().catch((error) => {
  console.error("💥 Server gagal melakukan booting:", error);
  process.exit(1);
});
