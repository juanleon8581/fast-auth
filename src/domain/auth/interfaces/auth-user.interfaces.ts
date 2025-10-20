import type { UserEntity } from "@/domain/user/entities/user.entity";
import { TRawJson } from "@/domain/interfaces/general.interfaces";

export interface IAuthUserEntityFromRaw {
  user: UserEntity;
  data: TRawJson;
}

export interface IAuthUserEntity {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
}
