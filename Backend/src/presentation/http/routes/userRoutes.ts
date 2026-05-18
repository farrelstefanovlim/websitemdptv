import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { validateRequest } from "../middlewares/validationHandler";
import { z } from "zod";

// Skema validasi request menggunakan Zod
const registerSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Nama wajib diisi",
    }).min(3, "Nama minimal harus 3 karakter"),
    email: z.string({
      required_error: "Email wajib diisi",
    }).email("Format email tidak valid"),
    password: z.string({
      required_error: "Password wajib diisi",
    }).min(6, "Password minimal harus 6 karakter"),
  }),
});

export function createUserRoutes(userController: UserController): Router {
  const router = Router();

  // Route: POST /api/users/register (Registrasi User Baru)
  router.post(
    "/register",
    validateRequest(registerSchema),
    userController.register
  );

  // Route: GET /api/users (Ambil semua user)
  router.get("/", userController.getAll);

  return router;
}
