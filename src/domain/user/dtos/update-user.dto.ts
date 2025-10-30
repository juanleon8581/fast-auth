import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";

interface IUpdateUserDto {
  sessionToken: string;
  refreshToken: string;
  email?: string;
  name?: string;
  lastname?: string;
  display_name?: string;
  role?: string;
  email_verified?: boolean;
  phone?: string;
  newPassword?: string;
  newPasswordConfirmation?: string;
}

export class UpdateUserDto {
  private constructor(
    public readonly sessionToken: string,
    public readonly refreshToken: string,
    public readonly email?: string,
    public readonly name?: string,
    public readonly lastname?: string,
    public readonly display_name?: string,
    public readonly role?: string,
    public readonly email_verified?: boolean,
    public readonly phone?: string,
    public readonly newPassword?: string,
    public readonly newPasswordConfirmation?: string,
  ) {
    Object.freeze(this);
  }

  private static create(props: IUpdateUserDto): UpdateUserDto {
    const {
      sessionToken,
      refreshToken,
      email,
      name,
      lastname,
      display_name,
      role,
      email_verified,
      phone,
      newPassword,
      newPasswordConfirmation,
    } = props;

    return new UpdateUserDto(
      sessionToken,
      refreshToken,
      email,
      name,
      lastname,
      display_name,
      role,
      email_verified,
      phone,
      newPassword,
      newPasswordConfirmation,
    );
  }

  static createFrom(json: TRawJson): [string?, UpdateUserDto?] {
    const {
      sessionToken,
      refreshToken,
      email,
      name,
      lastname,
      display_name,
      role,
      email_verified,
      phone,
      newPassword,
      newPasswordConfirmation,
    } = json;

    if (!sessionToken || !refreshToken)
      return [ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA];

    return [
      undefined,
      UpdateUserDto.create({
        sessionToken,
        refreshToken,
        email,
        name,
        lastname,
        display_name,
        role,
        email_verified,
        phone,
        newPassword,
        newPasswordConfirmation,
      }),
    ];
  }
}
