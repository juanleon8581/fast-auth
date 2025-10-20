import { LoginDto } from "@/domain/auth/dtos/login.dto";
import { LogoutDto } from "@/domain/auth/dtos/logout.dto";
import { RegisterDto } from "@/domain/auth/dtos/register.dto";
import { RequestResetPasswordEmailDto } from "@/domain/auth/dtos/request-reset-password-email.dto";
import { UpdateUserDto } from "@/domain/dtos/update-user.dto";
import { AuthUserEntity } from "@/domain/entities/auth-user.entity";
import { UserEntity } from "@/domain/entities/user.entity";

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
