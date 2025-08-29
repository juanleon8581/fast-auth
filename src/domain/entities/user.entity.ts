import { IUserData } from "../interfaces/user.interfaces";
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static createFrom = (raw: { [key: string]: any }): UserEntity => {
    const { id, email, name, email_verified, phone } = raw;

    if (!id || !email || !name || !email_verified) {
      throw new Error(ERRORS.DATA_VALIDATION.INVALID_DATA);
    }

    return this.create({ id, email, name, email_verified, phone });
  };
}
