import { TRawJson } from "@/domain/interfaces/general.interfaces";
import { ERRORS } from "@/config/strings/global.strings.json";

interface IUpdateUserDto {
  sessionToken: string;
  refreshToken: string;
  email?: string;
  newPassword?: string;
  newPasswordConfirmation?: string;
  phone?: string;
  name?: string;
  lastname?: string;
}

export class UpdateUserDto {
  constructor(
    public readonly sessionToken: string,
    public readonly refreshToken: string,
    public readonly email?: string,
    public readonly newPassword?: string,
    public readonly newPasswordConfirmation?: string,
    public readonly phone?: string,
    public readonly name?: string,
    public readonly lastname?: string,
  ) {
    Object.freeze(this);
  }

  private static create(props: IUpdateUserDto): UpdateUserDto {
    const {
      sessionToken,
      refreshToken,
      email,
      newPassword,
      newPasswordConfirmation,
      phone,
      name,
      lastname,
    } = props;

    return new UpdateUserDto(
      sessionToken,
      refreshToken,
      email,
      newPassword,
      newPasswordConfirmation,
      phone,
      name,
      lastname,
    );
  }

  static createFrom(json: TRawJson): [string?, UpdateUserDto?] {
    const {
      sessionToken,
      refreshToken,
      email,
      newPassword,
      newPasswordConfirmation,
      phone,
      name,
      lastname,
    } = json;

    if (!sessionToken || !refreshToken)
      return [ERRORS.DATA_VALIDATION.INVALID_DATA];

    return [
      undefined,
      UpdateUserDto.create({
        sessionToken,
        refreshToken,
        email,
        newPassword,
        newPasswordConfirmation,
        phone,
        name,
        lastname,
      }),
    ];
  }
}
