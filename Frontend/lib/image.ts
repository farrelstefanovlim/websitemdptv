/**
 * Utility untuk membangun URL gambar yang lengkap.
 * 
 * Backend upload mengembalikan path relatif seperti `/uploads/filename.jpg`.
 * Frontend (Next.js) jalan di port berbeda, jadi perlu prepend backend base URL.
 * 
 * Jika sudah berupa URL lengkap (http/https), dikembalikan apa adanya.
 */

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api/v1")
  .replace(/\/api\/v1\/?$/, ""); // Strip /api/v1 → http://localhost:3005

export function getImageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  return `${BACKEND_URL}${path}`;
}
