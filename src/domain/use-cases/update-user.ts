import { UpdateUserDto } from "@/domain/dtos/update-user.dto";
import { AuthUserEntity } from "../entities/auth-user.entity";
import { UserEntity } from "../entities/user.entity";
import { AuthRepository } from "@/domain/auth/repositories/auth.repository";

interface IUpdateUserUseCase {
  execute(dto: UpdateUserDto): Promise<UserEntity | AuthUserEntity>;
}

export class UpdateUser implements IUpdateUserUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(dto: UpdateUserDto): Promise<UserEntity | AuthUserEntity> {
    return this.repository.updateUser(dto);
  }
}
