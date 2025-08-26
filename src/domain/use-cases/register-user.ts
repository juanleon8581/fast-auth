import { RegisterDto } from "../dtos/register.dto";
import { AuthUserEntity } from "../entities/auth-user.entity";
import { UserEntity } from "../entities/user.entity";
import { AuthRepository } from "../repositories/auth.repository";

interface RegisterUserUseCase {
  execute(dto: RegisterDto): Promise<UserEntity | AuthUserEntity>;
}

export class RegisterUser implements RegisterUserUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(dto: RegisterDto): Promise<UserEntity | AuthUserEntity> {
    return this.repository.register(dto);
  }
}
