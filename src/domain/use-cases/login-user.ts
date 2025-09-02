import { LoginDto } from "../dtos/login.dto";
import { AuthUserEntity } from "../entities/auth-user.entity";
import { AuthRepository } from "../repositories/auth.repository";

interface ILoginUserUseCase {
  execute(dto: LoginDto): Promise<AuthUserEntity>;
}

export class LoginUser implements ILoginUserUseCase {
  constructor(private readonly repository: AuthRepository) {}
  execute(dto: LoginDto): Promise<AuthUserEntity> {
    return this.repository.login(dto);
  }
}
