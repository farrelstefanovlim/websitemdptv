import { User } from "@domain/entities/User";

export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export class UserMapper {
  public static toResponse(user: User): UserResponse {
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      createdAt: user.getCreatedAt().toISOString(),
      updatedAt: user.getUpdatedAt().toISOString(),
    };
  }

  public static toResponseList(users: User[]): UserResponse[] {
    return users.map((user) => this.toResponse(user));
  }
}
