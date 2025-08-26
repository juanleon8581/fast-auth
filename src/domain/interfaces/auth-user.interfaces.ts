import type { UserEntity } from "../entities/user.entity";

export interface IAuthUserEntityFromRaw {
  user: UserEntity;
  data: { [key: string]: any };
}

export interface IAuthUserEntity {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
}
