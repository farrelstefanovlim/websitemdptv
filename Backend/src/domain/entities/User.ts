import { Email } from "../value-objects/Email";
import { DomainException } from "../exceptions/DomainException";

export interface UserProps {
  id: string;
  name: string;
  email: Email;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private readonly id: string;
  private name: string;
  private email: Email;
  private password: string;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: UserProps): User {
    if (!props.id) {
      throw new DomainException("ID User diperlukan.");
    }
    if (!props.name || props.name.trim().length < 3) {
      throw new DomainException("Nama user minimal harus 3 karakter.");
    }
    if (!props.password || props.password.length < 6) {
      throw new DomainException("Password minimal harus 6 karakter.");
    }

    return new User(props);
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getEmail(): Email {
    return this.email;
  }

  public getPassword(): string {
    return this.password;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Domain Behaviors / Business Rules
  public changeName(newName: string): void {
    if (!newName || newName.trim().length < 3) {
      throw new DomainException("Nama baru minimal harus 3 karakter.");
    }
    this.name = newName;
    this.updatedAt = new Date();
  }

  public updateEmail(newEmail: Email): void {
    if (this.email.equals(newEmail)) {
      return; // email unchanged
    }
    this.email = newEmail;
    this.updatedAt = new Date();
  }
}
