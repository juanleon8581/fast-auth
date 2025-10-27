import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";
import {
  ILogData,
  LogLevel,
  LOG_LEVELS,
} from "@/domain/log/interfaces/log.interfaces";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";

export class LogEntity implements ILogData {
  constructor(
    public readonly level: LogLevel,
    public readonly message: string,
    public readonly timestamp: Date,
    public readonly id?: string,
    public readonly meta?: Record<string, unknown>,
    public readonly service?: string,
    public readonly userId?: string,
    public readonly requestId?: string,
    public readonly error?: string,
  ) {
    Object.freeze(this);
  }

  private static create(data: ILogData): LogEntity {
    return new LogEntity(
      data.level,
      data.message,
      data.timestamp,
      data.id,
      data.meta,
      data.service,
      data.userId,
      data.requestId,
      data.error,
    );
  }

  static createFrom = (raw: TRawJson): LogEntity => {
    const {
      id,
      level,
      message,
      timestamp,
      meta,
      service,
      userId,
      requestId,
      error,
    } = raw;

    if (!id || !level || !message || !timestamp) {
      throw new Error(ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA);
    }

    // Validate log level using the LOG_LEVELS array
    if (!LOG_LEVELS.includes(level as LogLevel)) {
      throw new Error(ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA);
    }

    // Ensure timestamp is a Date object
    const parsedTimestamp =
      timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isNaN(parsedTimestamp.getTime())) {
      throw new Error(ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA);
    }

    return this.create({
      id,
      level: level as LogLevel,
      message,
      timestamp: parsedTimestamp,
      meta,
      service,
      userId,
      requestId,
      error,
    });
  };
}
