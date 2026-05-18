import { IUserRepository } from "@domain/repositories/IUserRepository";
import { UserResponse, UserMapper } from "../dtos/UserDto";

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(): Promise<UserResponse[]> {
    const users = await this.userRepository.findAll();
    return UserMapper.toResponseList(users);
  }
}
