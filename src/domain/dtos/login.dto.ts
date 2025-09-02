import { TRawJson } from "../interfaces/general.interfaces";
import { ERRORS } from "@/config/strings/global.strings.json";

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

    if (!email || !password) return [ERRORS.DATA_VALIDATION.INVALID_DATA];

    return [undefined, LoginDto.create({ email, password })];
  }
}
