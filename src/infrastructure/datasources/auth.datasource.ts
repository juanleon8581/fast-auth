import { RegisterDto } from "@/domain/dtos/register.dto";
import { AuthUserEntity } from "@/domain/entities/auth-user.entity";
import { UserEntity } from "@/domain/entities/user.entity";
import { AuthRepository } from "@/domain/repositories/auth.repository";
import { AuthClient } from "../config/auth.client";
import { ERRORS } from "@/config/strings/global.strings.json";
import { DatasourceUserDto } from "../dtos/datasource-user.dto";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { ValidationError } from "@/domain/errors/validation-error";
import { LoginDto } from "@/domain/dtos/login.dto";
import { LogoutDto } from "@/domain/dtos/logout.dto";
import { UpdateUserDto } from "@/domain/dtos/update-user.dto";
import { SupabaseClient } from "@supabase/supabase-js";
import { TRawJson } from "@/domain/interfaces/general.interfaces";

export class AuthDatasource implements AuthRepository {
  constructor(private readonly client: typeof AuthClient) {
    Object.freeze(this);
  }

  private static async setSession(
    authClient: SupabaseClient,
    sessionToken: string,
    refreshToken: string,
  ): Promise<void> {
    const { error } = await authClient.auth.setSession({
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

    const { error } = await authClient.auth.signOut({ scope: "local" });

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

    await AuthDatasource.setSession(
      authClient,
      dto.sessionToken,
      dto.refreshToken,
    );

    const updateData: TRawJson = {};
    if (dto.email) updateData.email = dto.email;
    if (dto.phone) updateData.phone = dto.phone;

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

    return user;
  }

  async updateUserPassword(dto: UpdateUserDto): Promise<AuthUserEntity> {
    const authClient = new this.client().create();

    if (!dto.sessionToken || !dto.refreshToken || !dto.newPassword) {
      throw new BadRequestError(ERRORS.AUTH.UPDATE_USER.USER_NOT_UPDATED);
    }

    await AuthDatasource.setSession(
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
        access_token: dto.sessionToken,
        refresh_token: dto.refreshToken,
      },
    });
  }
}
