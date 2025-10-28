import { SyncUserFromAuthDto } from "@/domain/user/dtos/sync-user-from-auth.dto";
import { UserRepository } from "@/domain/user/repositories/user.repository";
import { DatabaseClient } from "@/infrastructure/persistence/database.client";

//TODO: Role assignment logic is not implemented yet.
export class UserDatasource implements UserRepository {
  constructor(private readonly client = DatabaseClient) {
    Object.freeze(this);
  }

  async upsertFromAuth(dto: SyncUserFromAuthDto): Promise<void> {
    const dbClient = this.client.create();

    await dbClient.user.upsert({
      where: { id: dto.id },
      update: {
        email: dto.email,
        role: "USER",
        profile: {
          name: dto.name,
          emailVerified: dto.email_verified,
          phone: dto.phone,
        },
      },
      create: {
        id: dto.id,
        email: dto.email,
        role: "USER",
        profile: {
          name: dto.name,
          emailVerified: dto.email_verified,
          phone: dto.phone,
        },
      },
    });
  }
}
