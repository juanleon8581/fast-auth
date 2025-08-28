import { CustomError } from "./custom-error";

export class ValidationError extends CustomError {
  constructor(message: string, field?: string, code?: string) {
    super(message, field, code);
  }

  getStatusCode(): number {
    return 422;
  }
}