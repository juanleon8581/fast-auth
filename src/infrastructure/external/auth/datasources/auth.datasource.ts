import { RegisterDto } from "@/domain/auth/dtos/register.dto";
import { AuthUserEntity } from "@/domain/auth/entities/auth-user.entity";
import { UserEntity } from "@/domain/user/entities/user.entity";
import { AuthRepository } from "@/domain/auth/repositories/auth.repository";
import { AuthClient } from "@/infrastructure/external/auth/auth.client";
import { ERRORS } from "@/config/strings/global.strings.json";
import { DatasourceUserDto } from "@/infrastructure/external/auth/mappers/datasource-user.dto";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { ValidationError } from "@/domain/errors/validation-error";
import { LoginDto } from "@/domain/auth/dtos/login.dto";
import { LogoutDto } from "@/domain/auth/dtos/logout.dto";
import { UpdateUserDto } from "@/domain/user/dtos/update-user.dto";
import { RequestResetPasswordEmailDto } from "@/domain/auth/dtos/request-reset-password-email.dto";
import { SupabaseClient } from "@supabase/supabase-js";
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";

export class AuthDatasource implements AuthRepository {
  constructor(private readonly client: typeof AuthClient) {
    Object.freeze(this);
  }

  private static async setSession(
    authClient: SupabaseClient,
    sessionToken: string,
    refreshToken: string,
  ): Promise<AuthUserEntity> {
    const { data, error } = await authClient.auth.setSession({
      access_token: sessionToken,
      refresh_token: refreshToken,
    });
    if (error) {
      throw new BadRequestError(
        error.message,
        error.code,
        error.status?.toString(),
      );
    }
    if (!data.user || !data.session)
      throw new BadRequestError(ERRORS.AUTH.LOGIN.USER_NOT_FOUND);

    const [errorDto, datasourceUserDto] = DatasourceUserDto.createFrom(
      data.user,
    );

    if (errorDto) throw new ValidationError(errorDto);
    const user = UserEntity.createFrom(datasourceUserDto!);

    const { data: refreshData, error: refreshError } =
      await authClient.auth.refreshSession({
        refresh_token: refreshToken,
      });

    if (refreshError) {
      throw new BadRequestError(
        refreshError.message,
        refreshError.code,
        refreshError.status?.toString(),
      );
    }
    if (!refreshData.session)
      throw new BadRequestError(ERRORS.AUTH.REFRESH_SESSION.SESSION_NOT_FOUND);

    return AuthUserEntity.createFrom({
      user,
      data: refreshData.session,
    });
  }

  async register(dto: RegisterDto): Promise<UserEntity | AuthUserEntity> {
    //* Create a new and unique instance of AuthClient for this request
    const authClient = new this.client().create();

    const { data, error } = await authClient.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          display_name: `${dto.name} ${dto.lastname}`,
        },
      },
    });

    if (error)
      throw new BadRequestError(
        error.message,
        error.code,
        error.status?.toString(),
      );
    if (!data.user)
      throw new BadRequestError(ERRORS.AUTH.REGISTER.USER_NO_CREATED);

    const [errorDto, datasourceUserDto] = DatasourceUserDto.createFrom(
      data.user,
    );
    if (errorDto) throw new ValidationError(errorDto);
    const user = UserEntity.createFrom(datasourceUserDto!);
    if (!data.session) return user;
    const authUser = AuthUserEntity.createFrom({
      user,
      data: data.session,
    });
    return authUser;
  }

  async login(dto: LoginDto): Promise<AuthUserEntity> {
    //* Create a new and unique instance of AuthClient for this request
    const authClient = new this.client().create();

    const { data, error } = await authClient.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error)
      throw new BadRequestError(
        error.message,
        error.code,
        error.status?.toString(),
      );
    if (!data.session)
      throw new BadRequestError(ERRORS.AUTH.LOGIN.USER_NOT_FOUND);

    const [errorDto, datasourceUserDto] = DatasourceUserDto.createFrom(
      data.user,
    );

    if (errorDto) throw new ValidationError(errorDto);
    const user = UserEntity.createFrom(datasourceUserDto!);

    const authUser = AuthUserEntity.createFrom({
      user,
      data: data.session,
    });
    return authUser;
  }

  async logout(dto: LogoutDto): Promise<void> {
    //* Create a new and unique instance of AuthClient for this request
    const authClient = new this.client().create();

    // Validate that we have the required tokens
    if (!dto.sessionToken || !dto.refreshToken) {
      throw new BadRequestError(ERRORS.AUTH.LOGOUT.USER_NOT_LOGGED_OUT);
    }

    await AuthDatasource.setSession(
      authClient,
      dto.sessionToken,
      dto.refreshToken,
    );

    const { error } = await authClient.auth.signOut({ scope: "global" });

    if (error) {
      throw new BadRequestError(
        error.message,
        error.code,
        error.status?.toString(),
      );
    }
  }

  async updateUser(dto: UpdateUserDto): Promise<UserEntity | AuthUserEntity> {
    const authClient = new this.client().create();

    if (!dto.sessionToken || !dto.refreshToken || dto.newPassword) {
      throw new BadRequestError(ERRORS.AUTH.UPDATE_USER.USER_NOT_UPDATED);
    }

    const actualUserSession = await AuthDatasource.setSession(
      authClient,
      dto.sessionToken,
      dto.refreshToken,
    );

    const updateData: TRawJson = {};
    if (dto.email) updateData.email = dto.email;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.name && dto.lastname)
      updateData.data = {
        display_name: `${dto.name} ${dto.lastname}`,
      };

    const { data, error } = await authClient.auth.updateUser(updateData);

    if (error) {
      throw new BadRequestError(
        error.message,
        error.code,
        error.status?.toString(),
      );
    }
    if (!data.user) {
      throw new BadRequestError(ERRORS.AUTH.UPDATE_USER.USER_NOT_UPDATED);
    }

    const [errorDto, datasourceUserDto] = DatasourceUserDto.createFrom(
      data.user,
    );

    if (errorDto) throw new ValidationError(errorDto);
    const user = UserEntity.createFrom(datasourceUserDto!);

    return AuthUserEntity.createFrom({
      user,
      data: {
        access_token: actualUserSession.accessToken,
        refresh_token: actualUserSession.refreshToken,
      },
    });
  }

  async updateUserPassword(dto: UpdateUserDto): Promise<AuthUserEntity> {
    const authClient = new this.client().create();

    if (!dto.sessionToken || !dto.refreshToken || !dto.newPassword) {
      throw new BadRequestError(ERRORS.AUTH.UPDATE_USER.USER_NOT_UPDATED);
    }

    const actualUserSession = await AuthDatasource.setSession(
      authClient,
      dto.sessionToken,
      dto.refreshToken,
    );

    const { data, error } = await authClient.auth.updateUser({
      password: dto.newPassword,
    });

    if (error) {
      throw new BadRequestError(
        error.message,
        error.code,
        error.status?.toString(),
      );
    }
    if (!data.user) {
      throw new BadRequestError(ERRORS.AUTH.UPDATE_USER.USER_NOT_UPDATED);
    }

    const [errorDto, datasourceUserDto] = DatasourceUserDto.createFrom(
      data.user,
    );

    if (errorDto) throw new ValidationError(errorDto);
    const user = UserEntity.createFrom(datasourceUserDto!);

    return AuthUserEntity.createFrom({
      user,
      data: {
        access_token: actualUserSession.accessToken,
        refresh_token: actualUserSession.refreshToken,
      },
    });
  }

  async requestResetPasswordEmail(
    dto: RequestResetPasswordEmailDto,
  ): Promise<void> {
    try {
      //* Create a new and unique instance of AuthClient for this request
      const authClient = new this.client().create();

      const { error } = await authClient.auth.resetPasswordForEmail(dto.email, {
        redirectTo: dto.redirectTo,
      });

      if (error) {
        throw new BadRequestError(
          ERRORS.AUTH.REQUEST_RESET_PASSWORD_EMAIL.EMAIL_NOT_SENT,
          error.code,
          error.status?.toString(),
        );
      }
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError(
        ERRORS.AUTH.REQUEST_RESET_PASSWORD_EMAIL.EMAIL_NOT_SENT,
      );
    }
  }
}
