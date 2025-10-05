import { CreateLogDto } from "../dtos/create-log.dto";
import { LogEntity } from "../entities/log.entity";

export abstract class LogRepository {
  abstract createLog(dto: CreateLogDto): Promise<LogEntity>;
  abstract getLogsByUserId(userId: string, limit?: number): Promise<LogEntity[]>;
  abstract getLogsByService(service: string, limit?: number): Promise<LogEntity[]>;
  abstract getLogsByLevel(level: string, limit?: number): Promise<LogEntity[]>;
  abstract getLogsByRequestId(requestId: string): Promise<LogEntity[]>;
  abstract deleteOldLogs(olderThanDays: number): Promise<number>;
}