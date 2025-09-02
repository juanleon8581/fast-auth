import type { UserEntity } from "../entities/user.entity";
import { TRawJson } from "./general.interfaces";

export interface IAuthUserEntityFromRaw {
  user: UserEntity;
  data: TRawJson;
}

export interface IAuthUserEntity {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
}
