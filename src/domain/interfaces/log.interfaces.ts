export type LogLevel = "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG" | "TRACE";

export const LOG_LEVELS: readonly LogLevel[] = [
  "FATAL",
  "ERROR",
  "WARN",
  "INFO",
  "DEBUG",
  "TRACE",
] as const;

export const PROD_LOG_LEVELS: readonly LogLevel[] = ["ERROR", "WARN", "FATAL"];

export interface ILogData {
  id?: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
  timestamp: Date;
  service?: string;
  userId?: string;
  requestId?: string;
  error?: string;
}

export interface ICreateLogData {
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
  service?: string;
  userId?: string;
  requestId?: string;
  error?: string;
}
