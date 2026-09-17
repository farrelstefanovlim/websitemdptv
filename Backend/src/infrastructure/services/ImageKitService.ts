import ImageKit from "imagekit";
import { env } from "@infrastructure/config/env";

export interface ImageKitUploadResult {
  url: string;
  fileId: string;
  name: string;
  size: number;
  filePath: string;
}

export class ImageKitService {
  private imagekit: ImageKit;

  constructor() {
    this.imagekit = new ImageKit({
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      privateKey: env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    });
  }

  public async upload(params: {
    file: Buffer | string;
    fileName: string;
    folder?: string;
  }): Promise<ImageKitUploadResult> {
    const response = await this.imagekit.upload({
      file: params.file,
      fileName: params.fileName,
      folder: params.folder || "/mdptv",
      useUniqueFileName: true,
    });

    return {
      url: response.url,
      fileId: response.fileId,
      name: response.name,
      size: response.size,
      filePath: response.filePath,
    };
  }

  public async deleteFile(fileId: string): Promise<void> {
    await this.imagekit.deleteFile(fileId);
  }
}
