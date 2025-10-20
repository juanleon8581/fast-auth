import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";
import { IUserData } from "@/domain/user/interfaces/user.interfaces";
import { ERRORS } from "@/config/strings/global.strings.json";

export class UserEntity implements IUserData {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly email_verified: boolean,
    public readonly phone?: string,
  ) {
    Object.freeze(this);
  }

  private static create(data: IUserData): UserEntity {
    return new UserEntity(
      data.id,
      data.email,
      data.name,
      data.email_verified,
      data.phone,
    );
  }

  static createFrom = (raw: TRawJson): UserEntity => {
    const { id, email, name, email_verified, phone } = raw;

    if (!id || !email || !name) {
      throw new Error(ERRORS.DATA_VALIDATION.INVALID_DATA);
    }

    // Distinguish between missing and explicitly unverified email
    if (email_verified === undefined || email_verified === null) {
      throw new Error(ERRORS.DATA_VALIDATION.INVALID_DATA);
    }
    if (email_verified === false) {
      throw new Error(ERRORS.DATA_VALIDATION.EMAIL_NOT_VERIFIED);
    }

    return this.create({ id, email, name, email_verified, phone });
  };
}
