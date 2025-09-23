import { LoginDto } from "../dtos/login.dto";
import { LogoutDto } from "../dtos/logout.dto";
import { RegisterDto } from "../dtos/register.dto";
import { AuthUserEntity } from "../entities/auth-user.entity";
import { UserEntity } from "../entities/user.entity";

export abstract class AuthRepository {
  abstract register(dto: RegisterDto): Promise<UserEntity | AuthUserEntity>;
  abstract login(dto: LoginDto): Promise<AuthUserEntity>;
  abstract logout(dto: LogoutDto): Promise<void>;
}
