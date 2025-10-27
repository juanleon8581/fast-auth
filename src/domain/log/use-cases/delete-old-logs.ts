import { LogRepository } from "@/domain/log/repositories/log.repository";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";

interface IDeleteOldLogsUseCase {
  execute(olderThanDays: number): Promise<number>;
}

export class DeleteOldLogs implements IDeleteOldLogsUseCase {
  constructor(private readonly repository: LogRepository) {}

  async execute(olderThanDays: number): Promise<number> {
    if (olderThanDays <= 0) {
      throw new Error(
        ERROR_MESSAGES.DATA_VALIDATION.DAYS_MUST_BE_GREATER_THAN_0,
      );
    }

    return this.repository.deleteOldLogs(olderThanDays);
  }
}
