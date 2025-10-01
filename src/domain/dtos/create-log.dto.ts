import { ERRORS } from "@/config/strings/global.strings.json";
import { TRawJson } from "../interfaces/general.interfaces";
import { LogLevel, LOG_LEVELS } from "../interfaces/log.interfaces";

interface ICreateLogDto {
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
  service?: string;
  userId?: string;
  requestId?: string;
  error?: string;
}

export class CreateLogDto {
  constructor(
    public readonly level: LogLevel,
    public readonly message: string,
    public readonly meta?: Record<string, unknown>,
    public readonly service?: string,
    public readonly userId?: string,
    public readonly requestId?: string,
    public readonly error?: string,
  ) {}

  private static create(props: ICreateLogDto): CreateLogDto {
    const { level, message, meta, service, userId, requestId, error } = props;

    return new CreateLogDto(
      level,
      message,
      meta,
      service,
      userId,
      requestId,
      error,
    );
  }

  static createFrom(props: TRawJson): [string?, CreateLogDto?] {
    const { level, message, meta, service, userId, requestId, error } = props;

    if (!level || !message) {
      return [ERRORS.DATA_VALIDATION.INVALID_DATA];
    }

    if (!LOG_LEVELS.includes(level as LogLevel)) {
      return [ERRORS.DATA_VALIDATION.INVALID_DATA];
    }

    if (typeof message !== "string" || message.trim().length === 0) {
      return [ERRORS.DATA_VALIDATION.INVALID_DATA];
    }

    if (meta && typeof meta !== "object") {
      return [ERRORS.DATA_VALIDATION.INVALID_DATA];
    }

    const stringFields = [service, userId, requestId, error];
    const validStringFields = stringFields.filter(
      (field) => !field || typeof field !== "string",
    );
    if (validStringFields.length > 0) {
      return [ERRORS.DATA_VALIDATION.INVALID_DATA];
    }

    return [
      undefined,
      CreateLogDto.create({
        level: level as LogLevel,
        message: message.trim(),
        meta,
        service,
        userId,
        requestId,
        error,
      }),
    ];
  }
}
