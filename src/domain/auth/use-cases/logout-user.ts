import { LogoutDto } from "@/domain/auth/dtos/logout.dto";
import { AuthRepository } from "@/domain/repositories/auth.repository";

interface LogoutAuthUseCase {
  execute(dto: LogoutDto): Promise<void>;
}

export class LogoutAuth implements LogoutAuthUseCase {
  constructor(private readonly datasource: AuthRepository) {}

  async execute(dto: LogoutDto): Promise<void> {
    await this.datasource.logout(dto);
  }
}
