import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
  constructor(message: string, field?: string, code?: string) {
    super(message, field, code);
  }

  getStatusCode(): number {
    return 400;
  }
}
