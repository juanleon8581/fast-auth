import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  constructor(message: string, field?: string, code?: string) {
    super(message, field, code);
  }

  getStatusCode(): number {
    return 404;
  }
}
