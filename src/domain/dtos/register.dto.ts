import { ERRORS } from "@/config/strings/global.strings.json";

interface IRegisterDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
}

export class RegisterDto {
  constructor(
    public readonly name: string,
    public readonly lastname: string,
    public readonly email: string,
    public readonly password: string,
  ) {}

  private static create(props: IRegisterDto): RegisterDto {
    const { name, lastname, email, password } = props;

    return new RegisterDto(name, lastname, email, password);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static createFrom(props: { [key: string]: any }): [string?, RegisterDto?] {
    const { name, lastname, email, password } = props;

    if (!name || !lastname || !email || !password)
      return [ERRORS.DATA_VALIDATION.INVALID_DATA];

    return [undefined, RegisterDto.create({ name, lastname, email, password })];
  }
}
