import { User } from "@domain/entities/User";
import { Email } from "@domain/value-objects/Email";
import { IUserRepository } from "@domain/repositories/IUserRepository";

/**
 * InMemoryUserRepository adalah implementasi in-memory repository untuk pengembangan/testing.
 * Anda dapat dengan mudah mengganti ini dengan adapter database riil (misal Prisma, TypeORM, atau Drizzle)
 * di dalam layer infrastruktur ini tanpa mengubah domain bisnis utama.
 */
export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  public async save(user: User): Promise<void> {
    this.users.set(user.getId(), user);
  }

  public async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user || null;
  }

  public async findByEmail(email: Email): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.getEmail().equals(email)) {
        return user;
      }
    }
    return null;
  }

  public async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  public async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}
