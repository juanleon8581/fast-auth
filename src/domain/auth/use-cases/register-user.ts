import { RegisterDto } from "@/domain/auth/dtos/register.dto";
import { AuthUserEntity } from "@/domain/auth/entities/auth-user.entity";
import { UserEntity } from "@/domain/entities/user.entity";
import { AuthRepository } from "@/domain/auth/repositories/auth.repository";

interface IRegisterUserUseCase {
  execute(dto: RegisterDto): Promise<UserEntity | AuthUserEntity>;
}

export class RegisterUser implements IRegisterUserUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(dto: RegisterDto): Promise<UserEntity | AuthUserEntity> {
    return this.repository.register(dto);
  }
}
