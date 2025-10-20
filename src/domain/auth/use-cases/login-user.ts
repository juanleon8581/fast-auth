import { LoginDto } from "@/domain/auth/dtos/login.dto";
import { AuthUserEntity } from "@/domain/entities/auth-user.entity";
import { AuthRepository } from "@/domain/repositories/auth.repository";

interface ILoginUserUseCase {
  execute(dto: LoginDto): Promise<AuthUserEntity>;
}

export class LoginUser implements ILoginUserUseCase {
  constructor(private readonly repository: AuthRepository) {}
  execute(dto: LoginDto): Promise<AuthUserEntity> {
    return this.repository.login(dto);
  }
}
