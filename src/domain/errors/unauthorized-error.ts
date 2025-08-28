import { CustomError } from "./custom-error";

export class UnauthorizedError extends CustomError {
  constructor(message: string, field?: string, code?: string) {
    super(message, field, code);
  }

  getStatusCode(): number {
    return 401;
  }
}
