import { LoginDto } from "../dtos/login.dto";
import { LogoutDto } from "../dtos/logout.dto";
import { RegisterDto } from "../dtos/register.dto";
import { RequestResetPasswordEmailDto } from "../dtos/request-reset-password-email.dto";
import { UpdateUserDto } from "../dtos/update-user.dto";
import { AuthUserEntity } from "../entities/auth-user.entity";
import { UserEntity } from "../entities/user.entity";

export abstract class AuthRepository {
  abstract register(dto: RegisterDto): Promise<UserEntity | AuthUserEntity>;
  abstract login(dto: LoginDto): Promise<AuthUserEntity>;
  abstract logout(dto: LogoutDto): Promise<void>;
  abstract updateUser(dto: UpdateUserDto): Promise<UserEntity | AuthUserEntity>;
  abstract updateUserPassword(dto: UpdateUserDto): Promise<AuthUserEntity>;
  abstract requestResetPasswordEmail(dto: RequestResetPasswordEmailDto): Promise<void>;
}
