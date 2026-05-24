import { User } from "@domain/entities/User";
import { Email } from "@domain/value-objects/Email";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { IHashService } from "../services/IHashService";
import { RegisterUserRequest, UserResponse, UserMapper } from "../dtos/UserDto";
import { DomainException } from "@domain/exceptions/DomainException";

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService
  ) {}

  public async execute(request: RegisterUserRequest): Promise<UserResponse> {
    const email = Email.create(request.email);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new DomainException("Email sudah terdaftar.");
    }

    const hashedPassword = await this.hashService.hash(request.password);
    const userId = crypto.randomUUID();

    const user = User.create({
      id: userId,
      username: request.username,
      fullName: request.fullName,
      email: email,
      role: request.role,
      passwordHash: hashedPassword,
      divisionId: request.divisionId
    });

    await this.userRepository.save(user);
    return UserMapper.toResponse(user);
  }
}
