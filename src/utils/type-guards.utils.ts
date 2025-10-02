export class TypeGuardsUtils {
  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") return error;
    return "Unknown error occurred";
  }

  static getAllErrorToString(error: unknown): string {
    if (error instanceof Error) return error.toString();
    return String(error);
  }
}
