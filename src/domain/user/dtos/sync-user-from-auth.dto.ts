import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";

interface ISyncUserFromAuthDto {
  id: string;
  email: string;
  name: string;
  lastname: string;
  display_name: string;
  role: string;
  email_verified?: boolean;
  phone?: string;
}

export class SyncUserFromAuthDto {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly lastname: string,
    public readonly display_name: string,
    public readonly role: string,
    public readonly email_verified?: boolean,
    public readonly phone?: string,
  ) {
    Object.freeze(this);
  }

  private static create(data: ISyncUserFromAuthDto) {
    const {
      id,
      email,
      name,
      lastname,
      display_name,
      role,
      email_verified,
      phone,
    } = data;

    return new SyncUserFromAuthDto(
      id,
      email,
      name,
      lastname,
      display_name,
      role,
      email_verified,
      phone,
    );
  }

  static createFrom(data: TRawJson): [string?, SyncUserFromAuthDto?] {
    const {
      id,
      email,
      name,
      lastname,
      display_name,
      role,
      email_verified,
      phone,
    } = data;

    if (!id || !email || !name || !lastname || !display_name || !role)
      return [ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA];

    return [
      undefined,
      SyncUserFromAuthDto.create({
        id,
        email,
        name,
        lastname,
        display_name,
        role,
        email_verified,
        phone,
      }),
    ];
  }
}
