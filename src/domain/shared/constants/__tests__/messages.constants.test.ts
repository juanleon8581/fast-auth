import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";

describe("ERROR_MESSAGES", () => {
  it("contains DATA_VALIDATION.MISSING_FIELDS message", () => {
    expect(ERROR_MESSAGES.DATA_VALIDATION.MISSING_FIELDS).toBe(
      "Required fields are missing",
    );
  });

  it("contains AUTH.LOGIN.VALIDATION.EMAIL.REQUIRED message", () => {
    expect(ERROR_MESSAGES.AUTH.LOGIN.VALIDATION.EMAIL.REQUIRED).toBe(
      "Email is required",
    );
  });
});