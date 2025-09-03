import type { User } from "@supabase/supabase-js";
import { ERRORS } from "@/config/strings/global.strings.json";

interface IDatasourceUserDto {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
  phone?: string;
}

export class DatasourceUserDto implements IDatasourceUserDto {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly email_verified: boolean,
    public readonly phone?: string,
  ) {
    Object.freeze(this);
  }

  private static create(props: IDatasourceUserDto): DatasourceUserDto {
    const { id, email, name, email_verified, phone } = props;

    return new DatasourceUserDto(id, email, name, email_verified, phone);
  }

  static createFrom = (raw: User): [string?, DatasourceUserDto?] => {
    const { id, email, email_confirmed_at, phone } = raw;
    const name = raw.user_metadata?.display_name;

    if (!id || !email || !name)
      return [ERRORS.AUTH.LOGIN.INVALID_DATA_RECEIVED];

    return [
      undefined,
      DatasourceUserDto.create({
        id,
        email,
        name,
        email_verified: !!email_confirmed_at,
        phone,
      }),
    ];
  };
}
