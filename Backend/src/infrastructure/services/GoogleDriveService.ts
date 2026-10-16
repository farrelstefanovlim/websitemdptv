import { drive as createDrive, drive_v3 } from "@googleapis/drive"
import { OAuth2Client } from "google-auth-library"
import { Readable } from "stream"
import { env } from "@infrastructure/config/env"

export interface StorageUploadParams {
  file: Buffer
  fileName: string
  mimeType: string
  /** true = siapa pun yang punya link bisa membuka. Default false (privat). */
  makePublic?: boolean
}

export interface StorageUploadResult {
  /** Link halaman penampil Drive (cocok untuk dibuka di tab baru, misalnya CV). */
  url: string
  /** Link langsung ke gambar (hanya bisa dipakai di <img> jika berkas dibuat publik). */
  imageUrl: string
  name: string
  fileId: string
  size: number
}

// Nama folder di Google Drive-mu. Dibuat otomatis kalau belum ada.
const ROOT_FOLDER_NAME = "MDPTV Uploads"

export class GoogleDriveService {
  private drive: drive_v3.Drive
  private folderIdPromise?: Promise<string>

  constructor() {
    const auth = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET)
    auth.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN })
    this.drive = createDrive({ version: "v3", auth })
  }

  /**
   * Dengan scope drive.file, aplikasi hanya bisa mengakses berkas/folder
   * yang dibuatnya sendiri. Karena itu folder tujuan dibuat lewat kode ini,
   * bukan dibuat manual di Drive.
   */
  private getFolderId(): Promise<string> {
    if (env.GOOGLE_DRIVE_FOLDER_ID) return Promise.resolve(env.GOOGLE_DRIVE_FOLDER_ID)

    this.folderIdPromise ??= this.findOrCreateFolder().catch((err) => {
      this.folderIdPromise = undefined // coba lagi pada upload berikutnya
      throw err
    })
    return this.folderIdPromise
  }

  private async findOrCreateFolder(): Promise<string> {
    const found = await this.drive.files.list({
      q: `name = '${ROOT_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id)",
      pageSize: 1,
    })
    const existingId = found.data.files?.[0]?.id
    if (existingId) return existingId

    const created = await this.drive.files.create({
      requestBody: { name: ROOT_FOLDER_NAME, mimeType: "application/vnd.google-apps.folder" },
      fields: "id",
    })
    if (!created.data.id) throw new Error("Gagal membuat folder di Google Drive.")
    return created.data.id
  }

  async upload({ file, fileName, mimeType, makePublic = false }: StorageUploadParams): Promise<StorageUploadResult> {
    const folderId = await this.getFolderId()

    const res = await this.drive.files.create({
      requestBody: { name: fileName, parents: [folderId] },
      media: { mimeType, body: Readable.from(file) },
      fields: "id, name, size, webViewLink",
    })

    const { id, name, size, webViewLink } = res.data
    if (!id || !webViewLink) {
      throw new Error("Google Drive tidak mengembalikan id/link berkas.")
    }

    if (makePublic) {
      await this.drive.permissions.create({
        fileId: id,
        requestBody: { role: "reader", type: "anyone" },
      })
    }

    return {
      url: webViewLink,
      imageUrl: `https://lh3.googleusercontent.com/d/${id}`,
      name: name ?? fileName,
      fileId: id,
      size: size ? Number(size) : file.length,
    }
  }
}