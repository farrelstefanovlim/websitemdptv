/**
 * Utility untuk membangun URL gambar yang lengkap.
 *
 * Backend upload mengembalikan path relatif seperti `/uploads/filename.jpg`.
 * Frontend (Next.js) jalan di port berbeda, jadi perlu prepend backend base URL.
 *
 * Jika sudah berupa URL lengkap (http/https), dikembalikan apa adanya.
 */

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api/v1").replace(/\/api\/v1\/?$/, "") // Strip /api/v1 → http://localhost:3005

export function getImageUrl(path: string): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path
  }
  return `${BACKEND_URL}${path}`
}

export interface ImageOptimizationOptions {
  /** Lebar maksimal dalam pixel (rasio aspek tetap dipertahankan). Default: 1920 */
  maxWidth?: number
  /** Tinggi maksimal dalam pixel (rasio aspek tetap dipertahankan). Default: 1920 */
  maxHeight?: number
  /** Kualitas kompresi dari 0.1 sampai 1.0. Default: 0.82 */
  quality?: number
  /** Format MIME target keluaran. Default: "image/webp" */
  format?: "image/webp" | "image/jpeg" | "image/png" | "original"
  /** Batas ukuran minimal (dalam byte) sebelum kompresi dilakukan. Default: 100KB (100 * 1024) */
  minSizeThreshold?: number
}

/**
 * Mengoptimasi dan meresize file gambar di sisi browser sebelum dikirim ke server / ImageKit.
 * - Mengurangi ukuran berkas secara signifikan (misal: 5-10MB kamera HP menjadi 150-350KB).
 * - Menjaga rasio aspek dengan downscaling bicubic halus (imageSmoothingQuality: high).
 * - Berkas non-gambar (seperti PDF pada CV) atau gambar vektor (SVG) dan GIF animasi tidak disentuh.
 * - Jika ukuran hasil kompresi lebih besar dari aslinya, berkas asli tetap digunakan.
 */
export async function optimizeImage(file: File, options: ImageOptimizationOptions = {}): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.82, format = "image/webp", minSizeThreshold = 100 * 1024 } = options

  // 1. Guard: Hanya proses jika berjalan di browser (client-side)
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file
  }

  // 2. Guard: Lewati file non-gambar, SVG, atau GIF animasi
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file
  }

  // 3. Guard: Lewati jika ukuran file sudah sangat kecil (< threshold)
  if (file.size <= minSizeThreshold) {
    return file
  }

  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img

      // Hitung dimensi proporsional baru
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      // Buat canvas untuk rendering
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(file)
        return
      }

      // Aktifkan smoothing berkualitas tinggi
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      // Gambar ke canvas
      ctx.drawImage(img, 0, 0, width, height)

      // Tentukan format target
      const targetMime = format === "original" ? file.type : format

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }

          // Jika ukuran hasil kompresi ternyata lebih besar dari aslinya, gunakan file asli
          if (blob.size >= file.size) {
            resolve(file)
            return
          }

          // Sesuaikan ekstensi nama file baru
          let newName = file.name
          if (targetMime === "image/webp" && !newName.toLowerCase().endsWith(".webp")) {
            newName = newName.replace(/\.[^.]+$/, "") + ".webp"
          } else if (targetMime === "image/jpeg" && !newName.toLowerCase().match(/\.(jpg|jpeg)$/)) {
            newName = newName.replace(/\.[^.]+$/, "") + ".jpg"
          }

          const optimizedFile = new File([blob], newName, {
            type: targetMime,
            lastModified: Date.now(),
          })

          resolve(optimizedFile)
        },
        targetMime,
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file) // Fallback jika gagal membaca image
    }

    img.src = objectUrl
  })
}
