import { z } from "zod"
import dotenv from "dotenv"

// Load file .env
dotenv.config()

const envSchema = z.object({
  PORT: z.coerce.number().default(3005),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  CORS_ORIGIN: z.string().optional(),

  // Google Drive (OAuth2 + refresh token)
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REFRESH_TOKEN: z.string().min(1),
  // Kosongkan saja. Folder "MDPTV Uploads" dibuat otomatis oleh aplikasi.
  GOOGLE_DRIVE_FOLDER_ID: z.string().optional(),

  // ImageKit tidak dipakai lagi. Hapus tiga baris ini setelah ImageKitService dihapus.
  // IMAGEKIT_PUBLIC_KEY: z.string().optional(),
  // IMAGEKIT_PRIVATE_KEY: z.string().optional(),
  // IMAGEKIT_URL_ENDPOINT: z.string().optional(),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error("❌ Konfigurasi Environment Variable tidak valid:", parsedEnv.error.format())
  process.exit(1)
}

export const env = parsedEnv.data
export type Env = z.infer<typeof envSchema>