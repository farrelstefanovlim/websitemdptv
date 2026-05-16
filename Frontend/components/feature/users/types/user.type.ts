export type UserRole = "superadmin" | "admin";

export interface AppUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  password: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}
