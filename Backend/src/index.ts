import { env } from "@infrastructure/config/env";
import { createExpressApp } from "@presentation/http/app";
import { InMemoryUserRepository } from "@infrastructure/database/InMemoryUserRepository";
import { BunHashService } from "@infrastructure/services/BunHashService";
import { RegisterUserUseCase } from "@application/use-cases/RegisterUserUseCase";
import { GetAllUsersUseCase } from "@application/use-cases/GetAllUsersUseCase";
import { UserController } from "@presentation/http/controllers/UserController";

async function bootstrap() {
  console.log("🚀 Memulai inisialisasi server...");

  // 1. Inisialisasi Database / Repositories (Infrastructure Layer)
  const userRepository = new InMemoryUserRepository();

  // 2. Inisialisasi Services (Infrastructure Layer)
  const hashService = new BunHashService();

  // 3. Inisialisasi Use Cases (Application Layer) dengan Dependency Injection (DI)
  const registerUserUseCase = new RegisterUserUseCase(userRepository, hashService);
  const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);

  // 4. Inisialisasi Controllers (Presentation Layer)
  const userController = new UserController(registerUserUseCase, getAllUsersUseCase);

  // 5. Inisialisasi Express App dengan Controllers
  const app = createExpressApp({
    userController,
  });

  // 6. Jalankan Server
  app.listen(env.PORT, () => {
    console.log(`\n======================================================`);
    console.log(`✨ Server berhasil berjalan di Port: ${env.PORT}`);
    console.log(`🚀 Lingkungan: ${env.NODE_ENV}`);
    console.log(`⚡ Didukung oleh Bun v${Bun.version}`);
    console.log(`👉 Cek Kesehatan: http://localhost:${env.PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

bootstrap().catch((error) => {
  console.error("💥 Server gagal melakukan booting:", error);
  process.exit(1);
});
