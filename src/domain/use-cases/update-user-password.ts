import { UpdateUserDto } from "@/domain/user/dtos/update-user.dto";
import { AuthUserEntity } from "../entities/auth-user.entity";
import { UserEntity } from "../entities/user.entity";
import { AuthRepository } from "@/domain/auth/repositories/auth.repository";

interface IUpdateUserPasswordUseCase {
  execute(dto: UpdateUserDto): Promise<UserEntity | AuthUserEntity>;
}

export class UpdateUserPassword implements IUpdateUserPasswordUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(dto: UpdateUserDto): Promise<UserEntity | AuthUserEntity> {
    return this.repository.updateUserPassword(dto);
  }
}
