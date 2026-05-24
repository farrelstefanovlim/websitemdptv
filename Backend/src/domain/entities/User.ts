import { Email } from "../value-objects/Email";
import { DomainException } from "../exceptions/DomainException";

export type Role = 'superadmin' | 'admin';

export interface UserProps {
  id: string;
  username: string;
  fullName: string;
  email: Email;
  role: Role;
  passwordHash: string;
  isActive?: boolean;
  divisionId?: string | null;
  createdAt?: Date;
  lastLogin?: Date | null;
}

export class User {
  private readonly id: string;
  private username: string;
  private fullName: string;
  private email: Email;
  private role: Role;
  private passwordHash: string;
  private isActive: boolean;
  private divisionId: string | null;
  private readonly createdAt: Date;
  private lastLogin: Date | null;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.username = props.username;
    this.fullName = props.fullName;
    this.email = props.email;
    this.role = props.role;
    this.passwordHash = props.passwordHash;
    this.isActive = props.isActive ?? true;
    this.divisionId = props.divisionId ?? null;
    this.createdAt = props.createdAt || new Date();
    this.lastLogin = props.lastLogin ?? null;
  }

  public static create(props: UserProps): User {
    if (!props.id) {
      throw new DomainException("ID User diperlukan.");
    }
    if (!props.username || props.username.trim().length < 3) {
      throw new DomainException("Username minimal harus 3 karakter.");
    }
    if (!props.fullName || props.fullName.trim().length < 3) {
      throw new DomainException("Nama lengkap minimal harus 3 karakter.");
    }
    if (!props.passwordHash || props.passwordHash.length < 6) {
      throw new DomainException("Password hash tidak valid.");
    }
    if (!['superadmin', 'admin'].includes(props.role)) {
      throw new DomainException("Role tidak valid.");
    }

    return new User(props);
  }

  // Getters
  public getId(): string { return this.id; }
  public getUsername(): string { return this.username; }
  public getFullName(): string { return this.fullName; }
  public getEmail(): Email { return this.email; }
  public getRole(): Role { return this.role; }
  public getPasswordHash(): string { return this.passwordHash; }
  public getIsActive(): boolean { return this.isActive; }
  public getDivisionId(): string | null { return this.divisionId; }
  public getCreatedAt(): Date { return this.createdAt; }
  public getLastLogin(): Date | null { return this.lastLogin; }

  // Domain Behaviors
  public changeFullName(newName: string): void {
    if (!newName || newName.trim().length < 3) {
      throw new DomainException("Nama baru minimal harus 3 karakter.");
    }
    this.fullName = newName;
  }

  public updateEmail(newEmail: Email): void {
    if (this.email.equals(newEmail)) return;
    this.email = newEmail;
  }

  public deactivate(): void {
    this.isActive = false;
  }

  public activate(): void {
    this.isActive = true;
  }

  public recordLogin(): void {
    this.lastLogin = new Date();
  }
}
