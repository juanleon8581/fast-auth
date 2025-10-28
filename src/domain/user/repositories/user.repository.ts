import { SyncUserFromAuthDto } from "../dtos/sync-user-from-auth.dto";

export abstract class UserRepository {
  abstract upsertFromAuth(input: SyncUserFromAuthDto): Promise<void>;
}
