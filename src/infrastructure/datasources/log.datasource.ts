import { LogRepository } from "@/domain/repositories/log.repository";
import { LogEntity } from "@/domain/entities/log.entity";
import { CreateLogDto } from "@/domain/dtos/create-log.dto";
import { DatabaseClient } from "../config/database.client";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { ValidationError } from "@/domain/errors/validation-error";
import type { LogLevel } from "@/domain/interfaces/log.interfaces";
import { LOG_LEVELS } from "@/domain/interfaces/log.interfaces";
import { TRawJson } from "@/domain/interfaces/general.interfaces";

// Type for Prisma Log model
interface PrismaLogData {
  id: string;
  level: string;
  message: string;
  timestamp: Date;
  meta: unknown;
  service: string | null;
  userId: string | null;
  requestId: string | null;
  error: string | null;
}

export class LogDatasource implements LogRepository {
  private readonly client = DatabaseClient;
  constructor() {
    Object.freeze(this);
  }

  /**
   * Creates a new log entry in the database
   */
  async createLog(dto: CreateLogDto): Promise<LogEntity> {
    try {
      // Validate input
      if (!dto) {
        throw new ValidationError("Log data is required");
      }

      const dbClient = this.client.create();

      const logData = await dbClient.log.create({
        data: {
          level: dto.level as LogLevel,
          message: dto.message,
          meta: dto.meta as TRawJson,
          service: dto.service,
          userId: dto.userId,
          requestId: dto.requestId,
          error: dto.error,
        },
      });

      return this.mapToLogEntity(logData);
    } catch (error) {
      if (
        error instanceof BadRequestError ||
        error instanceof ValidationError
      ) {
        throw error;
      }
      throw new BadRequestError(
        `Failed to create log: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Retrieves logs by user ID with optional limit
   */
  async getLogsByUserId(userId: string, limit?: number): Promise<LogEntity[]> {
    try {
      // Validate input
      if (!userId?.trim()) {
        throw new ValidationError("User ID is required");
      }

      if (limit !== undefined && (limit <= 0 || limit > 1000)) {
        throw new ValidationError("Limit must be between 1 and 1000");
      }

      const dbClient = this.client.create();

      const logs = await dbClient.log.findMany({
        where: { userId },
        orderBy: { timestamp: "desc" },
        ...(limit && { take: limit }),
      });

      return logs.map((logData: PrismaLogData) => this.mapToLogEntity(logData));
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new BadRequestError(
        `Failed to get logs by user ID: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Retrieves logs by service name with optional limit
   */
  async getLogsByService(
    service: string,
    limit?: number,
  ): Promise<LogEntity[]> {
    try {
      // Validate input
      if (!service?.trim()) {
        throw new ValidationError("Service name is required");
      }

      if (limit !== undefined && (limit <= 0 || limit > 1000)) {
        throw new ValidationError("Limit must be between 1 and 1000");
      }

      const dbClient = this.client.create();

      const logs = await dbClient.log.findMany({
        where: { service },
        orderBy: { timestamp: "desc" },
        ...(limit && { take: limit }),
      });

      return logs.map((logData: PrismaLogData) => this.mapToLogEntity(logData));
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new BadRequestError(
        `Failed to get logs by service: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Retrieves logs by log level with optional limit
   */
  async getLogsByLevel(level: string, limit?: number): Promise<LogEntity[]> {
    try {
      // Validate input
      if (!level?.trim()) {
        throw new ValidationError("Log level is required");
      }

      if (!LOG_LEVELS.includes(level as LogLevel)) {
        throw new ValidationError(
          `Invalid log level. Must be one of: ${LOG_LEVELS.join(", ")}`,
        );
      }

      if (limit !== undefined && (limit <= 0 || limit > 1000)) {
        throw new ValidationError("Limit must be between 1 and 1000");
      }

      const dbClient = this.client.create();

      const logs = await dbClient.log.findMany({
        where: { level: level as LogLevel },
        orderBy: { timestamp: "desc" },
        ...(limit && { take: limit }),
      });

      return logs.map((logData: PrismaLogData) => this.mapToLogEntity(logData));
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new BadRequestError(
        `Failed to get logs by level: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Retrieves logs by request ID
   */
  async getLogsByRequestId(requestId: string): Promise<LogEntity[]> {
    try {
      // Validate input
      if (!requestId?.trim()) {
        throw new ValidationError("Request ID is required");
      }

      const dbClient = this.client.create();

      const logs = await dbClient.log.findMany({
        where: { requestId },
        orderBy: { timestamp: "desc" },
      });

      return logs.map((logData: PrismaLogData) => this.mapToLogEntity(logData));
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new BadRequestError(
        `Failed to get logs by request ID: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Deletes logs older than specified number of days
   */
  async deleteOldLogs(olderThanDays: number): Promise<number> {
    try {
      // Validate input
      if (olderThanDays <= 0 || olderThanDays > 365) {
        throw new ValidationError("Days must be between 1 and 365");
      }

      const dbClient = this.client.create();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await dbClient.log.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      return result.count;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new BadRequestError(
        `Failed to delete old logs: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Maps Prisma log data to LogEntity
   */
  private mapToLogEntity(logData: PrismaLogData): LogEntity {
    try {
      return LogEntity.createFrom({
        id: logData.id,
        level: logData.level as LogLevel,
        message: logData.message,
        timestamp: logData.timestamp,
        meta: logData.meta as Record<string, unknown>,
        service: logData.service || undefined,
        userId: logData.userId || undefined,
        requestId: logData.requestId || undefined,
        error: logData.error || undefined,
      });
    } catch (error) {
      throw new ValidationError(
        `Failed to map log data to entity: ${(error as Error).message}`,
      );
    }
  }
}
