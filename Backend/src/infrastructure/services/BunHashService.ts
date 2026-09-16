import { IHashService } from "@application/services/IHashService";
import crypto from "crypto";

export class BunHashService implements IHashService {
  public async hash(password: string): Promise<string> {
    if (typeof Bun !== "undefined" && Bun.password) {
      return await Bun.password.hash(password);
    }
    // Fallback Node.js using crypto.scrypt
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = await new Promise<Buffer>((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });
    return `scrypt:${salt}:${derivedKey.toString("hex")}`;
  }

  public async compare(password: string, hashed: string): Promise<boolean> {
    if (hashed.startsWith("scrypt:")) {
      const parts = hashed.split(":");
      if (parts.length !== 3) return false;
      const salt = parts[1];
      const keyHex = parts[2];
      const keyBuffer = Buffer.from(keyHex, "hex");
      const derivedKey = await new Promise<Buffer>((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (err, key) => {
          if (err) reject(err);
          else resolve(key);
        });
      });
      return crypto.timingSafeEqual(keyBuffer, derivedKey);
    }

    if (typeof Bun !== "undefined" && Bun.password) {
      return await Bun.password.verify(password, hashed);
    }

    return false;
  }
}
