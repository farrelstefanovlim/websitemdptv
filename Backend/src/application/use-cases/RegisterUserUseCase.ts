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
    // 1. Validasi format email menggunakan Value Object
    const email = Email.create(request.email);

    // 2. Cek apakah email sudah terdaftar
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new DomainException("Email sudah terdaftar.");
    }

    // 3. Hash password menggunakan hash service abstraction
    const hashedPassword = await this.hashService.hash(request.password);

    // 4. Generate ID unik (kita gunakan crypto.randomUUID() bawaan Bun/Node)
    const userId = crypto.randomUUID();

    // 5. Buat Entity User (aturan bisnis akan otomatis divalidasi di sini)
    const user = User.create({
      id: userId,
      name: request.name,
      email: email,
      password: hashedPassword,
    });

    // 6. Simpan user ke database via repository
    await this.userRepository.save(user);

    // 7. Kembalikan data dalam bentuk DTO
    return UserMapper.toResponse(user);
  }
}
