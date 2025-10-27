import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";
import { TRawJson } from "../../shared/interfaces/general.interfaces";

interface ILoginDto {
  email: string;
  password: string;
}

export class LoginDto {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {
    Object.freeze(this);
  }

  private static create(props: ILoginDto): LoginDto {
    const { email, password } = props;

    return new LoginDto(email, password);
  }

  static createFrom(data: TRawJson): [string?, LoginDto?] {
    const { email, password } = data;

    if (!email || !password)
      return [ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA];

    return [undefined, LoginDto.create({ email, password })];
  }
}
