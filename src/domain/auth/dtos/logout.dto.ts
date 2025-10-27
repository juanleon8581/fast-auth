import { TRawJson } from "../../shared/interfaces/general.interfaces";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";

export class LogoutDto {
  constructor(
    public readonly sessionToken: string,
    public readonly refreshToken: string,
  ) {
    Object.freeze(this);
  }

  private static create(props: LogoutDto): LogoutDto {
    const { sessionToken, refreshToken } = props;

    return new LogoutDto(sessionToken, refreshToken);
  }

  static createFrom(data: TRawJson): [string?, LogoutDto?] {
    const { sessionToken, refreshToken } = data;

    if (!sessionToken || !refreshToken)
      return [ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA];

    return [undefined, LogoutDto.create({ sessionToken, refreshToken })];
  }
}
