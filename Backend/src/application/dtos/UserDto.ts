import { User, Role } from "@domain/entities/User";

export interface RegisterUserRequest {
  username: string;
  fullName: string;
  email: string;
  password: string;
  role: Role;
  divisionId?: string;
}

export interface UserResponse {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
  divisionId: string | null;
  createdAt: string;
}

export class UserMapper {
  public static toResponse(user: User): UserResponse {
    return {
      id: user.getId(),
      username: user.getUsername(),
      fullName: user.getFullName(),
      email: user.getEmail().getValue(),
      role: user.getRole(),
      isActive: user.getIsActive(),
      divisionId: user.getDivisionId(),
      createdAt: user.getCreatedAt().toISOString(),
    };
  }

  public static toResponseList(users: User[]): UserResponse[] {
    return users.map((user) => this.toResponse(user));
  }
}
