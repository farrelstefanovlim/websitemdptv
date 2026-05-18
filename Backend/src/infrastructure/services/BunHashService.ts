import { IHashService } from "@application/services/IHashService";

export class BunHashService implements IHashService {
  public async hash(password: string): Promise<string> {
    // Menggunakan hashing password bawaan Bun yang sangat cepat dan aman (bcrypt secara default)
    return await Bun.password.hash(password);
  }

  public async compare(password: string, hashed: string): Promise<boolean> {
    return await Bun.password.verify(password, hashed);
  }
}
