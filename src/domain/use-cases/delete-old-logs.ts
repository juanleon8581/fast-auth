import { LogRepository } from "../repositories/log.repository";

interface IDeleteOldLogsUseCase {
  execute(olderThanDays: number): Promise<number>;
}

export class DeleteOldLogs implements IDeleteOldLogsUseCase {
  constructor(private readonly repository: LogRepository) {}

  async execute(olderThanDays: number): Promise<number> {
    if (olderThanDays <= 0) {
      throw new Error("Days must be greater than 0");
    }
    
    return this.repository.deleteOldLogs(olderThanDays);
  }
}