import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";

export class SyncUserFromAuthDto {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name?: string,
    public readonly email_verified?: boolean,
    public readonly phone?: string,
  ) {
    Object.freeze(this);
  }

  private static create(
    id: string,
    email: string,
    name?: string,
    email_verified?: boolean,
    phone?: string,
  ) {
    return new SyncUserFromAuthDto(id, email, name, email_verified, phone);
  }

  static createFrom(data: TRawJson): [string?, SyncUserFromAuthDto?] {
    const { id, email, name, email_verified, phone } = data;

    if (!id || !email) return [ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA];

    return [
      undefined,
      SyncUserFromAuthDto.create(id, email, name, email_verified, phone),
    ];
  }
}
