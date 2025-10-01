export type LogLevel = 
  | "ERROR"
  | "WARN" 
  | "INFO"
  | "HTTP"
  | "VERBOSE"
  | "DEBUG"
  | "SILLY";

export const LOG_LEVELS: readonly LogLevel[] = [
  "ERROR",
  "WARN",
  "INFO", 
  "HTTP",
  "VERBOSE",
  "DEBUG",
  "SILLY"
] as const;

export interface ILogData {
  id: string;
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