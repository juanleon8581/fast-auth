import { TextEncoder, TextDecoder } from "node:util";

export class TypeGuardsUtils {
  static truncateStringByKB(str: string, kbLimit: number): string {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder("utf-8");

    // Encode the string to a Uint8Array (UTF-8 bytes)
    const encoded = encoder.encode(str);

    // Calculate the byte limit
    const byteLimit = kbLimit * 1024;

    // If the encoded string is already within the limit, return the original string
    if (encoded.length <= byteLimit) {
      return str;
    }

    // Slice the encoded array to the byte limit
    const truncatedEncoded = encoded.slice(0, byteLimit);

    // Decode the truncated byte array back to a string
    let result = decoder.decode(truncatedEncoded);

    // Handle potential incomplete multi-byte characters at the truncation point
    // The TextDecoder will replace incomplete characters with the replacement character (U+FFFD).
    // We can remove these if desired, or handle them based on specific requirements.
    // For simplicity, this example removes them.
    result = result.replace(/\uFFFD/g, "");

    return result;
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return TypeGuardsUtils.truncateStringByKB(error.message, 2);
    }
    if (typeof error === "string") return error;
    return "Unknown error occurred";
  }

  static getAllErrorToString(error: unknown): string {
    if (error instanceof Error)
      return TypeGuardsUtils.truncateStringByKB(error.toString(), 2);
    return TypeGuardsUtils.truncateStringByKB(String(error), 2);
  }
}
