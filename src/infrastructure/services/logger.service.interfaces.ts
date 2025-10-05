import { LogLevel } from "@/domain/interfaces/log.interfaces";
import type { Request, Response } from "express";

export interface IGenericLog {
  level: LogLevel;
  req: Request;
  service: string;
  res?: Response;
  message?: string;
  error?: unknown;
  meta?: Record<string, unknown>;
}

export interface IErrorlogData {
  error: unknown;
  req: Request;
  res: Response;
  service: string;
}

export interface IInfoLogData {
  message: string;
  req: Request;
  service: string;
  res?: Response;
  meta?: Record<string, unknown>;
}
