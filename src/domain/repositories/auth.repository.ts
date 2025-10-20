import { LoginDto } from "../auth/dtos/login.dto";
import { LogoutDto } from "../auth/dtos/logout.dto";
import { RegisterDto } from "../auth/dtos/register.dto";
import { RequestResetPasswordEmailDto } from "../auth/dtos/request-reset-password-email.dto";
import { UpdateUserDto } from "../dtos/update-user.dto";
import { AuthUserEntity } from "../entities/auth-user.entity";
import { UserEntity } from "../entities/user.entity";

export abstract class AuthRepository {
  abstract register(dto: RegisterDto): Promise<UserEntity | AuthUserEntity>;
  abstract login(dto: LoginDto): Promise<AuthUserEntity>;
  abstract logout(dto: LogoutDto): Promise<void>;
  abstract updateUser(dto: UpdateUserDto): Promise<UserEntity | AuthUserEntity>;
  abstract updateUserPassword(dto: UpdateUserDto): Promise<AuthUserEntity>;
  abstract requestResetPasswordEmail(
    dto: RequestResetPasswordEmailDto,
  ): Promise<void>;
}
