import { ERRORS } from "@/config/strings/global.strings.json";

export class RegisterDto {
  constructor(
    public readonly name: string,
    public readonly lastname: string,
    public readonly email: string,
    public readonly password: string
  ) {}

  static create(props: { [key: string]: any }): [string?, RegisterDto?] {
    const { name, lastname, email, password } = props;

    if (!name || !lastname || !email || !password)
      return [ERRORS.DATA_VALIDATION.INVALID_DATA];

    return [, new RegisterDto(name, lastname, email, password)];
  }
}
