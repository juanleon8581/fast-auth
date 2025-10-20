import { TRawJson } from "../../shared/interfaces/general.interfaces";
import { ERRORS } from "@/config/strings/global.strings.json";

interface IRequestResetPasswordEmailDto {
  email: string;
  redirectTo?: string;
}

export class RequestResetPasswordEmailDto {
  constructor(
    public readonly email: string,
    public readonly redirectTo?: string,
  ) {
    Object.freeze(this);
  }

  private static create(
    props: IRequestResetPasswordEmailDto,
  ): RequestResetPasswordEmailDto {
    const { email, redirectTo } = props;

    return new RequestResetPasswordEmailDto(email, redirectTo);
  }

  static createFrom(data: TRawJson): [string?, RequestResetPasswordEmailDto?] {
    const { email, redirectTo } = data;

    if (!email) return [ERRORS.DATA_VALIDATION.INVALID_DATA];

    return [
      undefined,
      RequestResetPasswordEmailDto.create({ email, redirectTo }),
    ];
  }
}
