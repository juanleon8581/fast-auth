import type { UserEntity } from "../entities/user.entity";

export interface IAuthUserEntityFromRaw {
  user: UserEntity;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { [key: string]: any };
}

export interface IAuthUserEntity {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
}
