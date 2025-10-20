import { RequestResetPasswordEmailDto } from "@/domain/auth/dtos/request-reset-password-email.dto";
import { AuthRepository } from "@/domain/auth/repositories/auth.repository";

interface IRequestResetPasswordEmailUseCase {
  execute(dto: RequestResetPasswordEmailDto): Promise<void>;
}

export class RequestResetPasswordEmail
  implements IRequestResetPasswordEmailUseCase
{
  constructor(private readonly repository: AuthRepository) {}

  async execute(dto: RequestResetPasswordEmailDto): Promise<void> {
    return this.repository.requestResetPasswordEmail(dto);
  }
}
