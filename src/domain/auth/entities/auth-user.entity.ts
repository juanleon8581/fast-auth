import type {
  IAuthUserEntity,
  IAuthUserEntityFromRaw,
} from "@/domain/auth/interfaces/auth-user.interfaces";
import { UserEntity } from "@/domain/user/entities/user.entity";

export class AuthUserEntity {
  private constructor(
    public readonly user: UserEntity,
    public readonly accessToken: string,
    public readonly refreshToken: string,
  ) {
    Object.freeze(this);
  }

  private static create(props: IAuthUserEntity): AuthUserEntity {
    return new AuthUserEntity(
      props.user,
      props.accessToken,
      props.refreshToken,
    );
  }

  static createFrom(raw: IAuthUserEntityFromRaw) {
    const { access_token, refresh_token } = raw.data;
    if (!access_token || !refresh_token || !(raw.user instanceof UserEntity)) {
      throw new Error("Invalid auth user data");
    }

    return AuthUserEntity.create({
      user: raw.user,
      accessToken: access_token,
      refreshToken: refresh_token,
    });
  }
}
