import { RegisterDto } from "@/domain/dtos/register.dto";
import { AuthUserEntity } from "@/domain/entities/auth-user.entity";
import { UserEntity } from "@/domain/entities/user.entity";
import { AuthRepository } from "@/domain/repositories/auth.repository";
import { AuthClient } from "../config/auth.client";
import { ERRORS } from "@/config/strings/global.strings.json";
import { DatasourceUserDto } from "../dtos/datasource-user.dto";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { ValidationError } from "@/domain/errors/validation-error";

export class AuthDatasource implements AuthRepository {
  constructor(private readonly client: typeof AuthClient) {}
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
        error.status?.toString()
      );
    if (!data.user)
      throw new BadRequestError(ERRORS.AUTH.REGISTER.USER_NO_CREATED);

    const [errorDto, datasourceUserDto] = DatasourceUserDto.createFrom(
      data.user
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
}
