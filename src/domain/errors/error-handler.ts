import { CustomError } from "./custom-error";

interface ErrorResponse {
  status: "error";
  code: number;
  errors: { message: string; field?: string; code?: string }[];
}

export class ErrorHandler {
  static handle(error: unknown): ErrorResponse {
    if (error instanceof CustomError) {
      return {
        status: "error",
        code: error.getStatusCode(),
        errors: error.serializeErrors(),
      };
    }

    return {
      status: "error",
      code: 500,
      errors: [{ message: "Internal Server Error" }],
    };
  }
}
