import { CustomError } from "./custom-error";
import {
  IApiErrorResponse,
  ApiResponseBuilder,
} from "@/presentation/utils/api-response";

export class ErrorHandler {
  static handle(
    error: unknown,
    requestId?: string,
    version: string = "1.0.0",
  ): IApiErrorResponse {
    if (error instanceof CustomError) {
      return ApiResponseBuilder.error(
        error.getStatusCode(),
        error.serializeErrors(),
        {
          requestId: requestId || "",
          timestamp: new Date().toISOString(),
          version,
        },
      );
    }

    return ApiResponseBuilder.error(
      500,
      [{ message: "Internal Server Error" }],
      {
        requestId: requestId || "",
        timestamp: new Date().toISOString(),
        version,
      },
    );
  }
}
