import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User, Role } from "../../domain/entities/User";
import { Email } from "../../domain/value-objects/Email";
import prisma from "./prismaClient";

export class PrismaUserRepository implements IUserRepository {
  public async save(user: User): Promise<void> {
    await prisma.user.upsert({
      where: { id: user.getId() },
      update: {
        username: user.getUsername(),
        full_name: user.getFullName(),
        email: user.getEmail().getValue(),
        role: user.getRole(),
        password_hash: user.getPasswordHash(),
        is_active: user.getIsActive(),
        division_id: user.getDivisionId(),
        last_login: user.getLastLogin(),
      },
      create: {
        id: user.getId(),
        username: user.getUsername(),
        full_name: user.getFullName(),
        email: user.getEmail().getValue(),
        role: user.getRole(),
        password_hash: user.getPasswordHash(),
        is_active: user.getIsActive(),
        division_id: user.getDivisionId(),
        created_at: user.getCreatedAt(),
        last_login: user.getLastLogin(),
      }
    });
  }

  public async findById(id: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({ where: { id } });
    return raw ? this.mapToDomain(raw) : null;
  }

  public async findByEmail(email: Email): Promise<User | null> {
    const raw = await prisma.user.findUnique({ where: { email: email.getValue() } });
    return raw ? this.mapToDomain(raw) : null;
  }

  public async findAll(): Promise<User[]> {
    const raws = await prisma.user.findMany();
    return raws.map((r: any) => this.mapToDomain(r));
  }

  public async delete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { is_active: false }
    });
  }

  private mapToDomain(raw: any): User {
    return User.create({
      id: raw.id,
      username: raw.username,
      fullName: raw.full_name,
      email: Email.create(raw.email),
      role: raw.role as Role,
      passwordHash: raw.password_hash,
      isActive: raw.is_active,
      divisionId: raw.division_id,
      createdAt: raw.created_at,
      lastLogin: raw.last_login,
    });
  }
}
