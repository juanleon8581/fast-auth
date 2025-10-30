import { SyncUserFromAuthDto } from "../dtos/sync-user-from-auth.dto";
import { UserRepository } from "../repositories/user.repository";

interface ISyncUserFromAuthUseCase {
  execute(dto: SyncUserFromAuthDto): Promise<void>;
}

export class SyncUserFromAuth implements ISyncUserFromAuthUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(dto: SyncUserFromAuthDto): Promise<void> {
    await this.repository.upsertFromAuth(dto);
  }
}
