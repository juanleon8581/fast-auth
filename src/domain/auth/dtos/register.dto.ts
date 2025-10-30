import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";
import { TRawJson } from "../../shared/interfaces/general.interfaces";
import { TUserRole } from "../interfaces/auth-user.interfaces";

interface IRegisterDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: TUserRole;
  metadata?: TRawJson;
  phone?: string;
}

export class RegisterDto {
  private constructor(
    public readonly name: string,
    public readonly lastname: string,
    public readonly email: string,
    public readonly password: string,
    public readonly role: TUserRole,
    public readonly metadata?: TRawJson,
    public readonly phone?: string,
  ) {}

  private static create(props: IRegisterDto): RegisterDto {
    const { name, lastname, email, password, phone, role, metadata } = props;

    return new RegisterDto(
      name,
      lastname,
      email,
      password,
      role,
      metadata,
      phone,
    );
  }

  static createFrom(props: TRawJson): [string?, RegisterDto?] {
    const { name, lastname, email, password, phone, role, metadata } = props;

    if (!name || !lastname || !email || !password || !role)
      return [ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA];

    return [
      undefined,
      RegisterDto.create({
        name,
        lastname,
        email,
        password,
        role,
        metadata,
        phone,
      }),
    ];
  }
}
