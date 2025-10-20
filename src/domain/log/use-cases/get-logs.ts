import { LogEntity } from "@/domain/entities/log.entity";
import { LogRepository } from "@/domain/log/repositories/log.repository";

interface IGetLogsUseCase {
  getByUserId(userId: string, limit?: number): Promise<LogEntity[]>;
  getByService(service: string, limit?: number): Promise<LogEntity[]>;
  getByLevel(level: string, limit?: number): Promise<LogEntity[]>;
  getByRequestId(requestId: string): Promise<LogEntity[]>;
}

export class GetLogs implements IGetLogsUseCase {
  constructor(private readonly repository: LogRepository) {}

  async getByUserId(userId: string, limit?: number): Promise<LogEntity[]> {
    return this.repository.getLogsByUserId(userId, limit);
  }

  async getByService(service: string, limit?: number): Promise<LogEntity[]> {
    return this.repository.getLogsByService(service, limit);
  }

  async getByLevel(level: string, limit?: number): Promise<LogEntity[]> {
    return this.repository.getLogsByLevel(level, limit);
  }

  async getByRequestId(requestId: string): Promise<LogEntity[]> {
    return this.repository.getLogsByRequestId(requestId);
  }
}
