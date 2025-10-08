import { CreateLogValidator } from "../create-log.validator";
import { CreateLogDto } from "@/domain/dtos/create-log.dto";
import { ValidationError } from "@/domain/errors/validation-error";

describe("CreateLogValidator", () => {
  it("returns CreateLogDto when data is valid", () => {
    const valid = {
      level: "INFO",
      message: "hello",
      meta: { a: 1 },
      service: "svc",
    };
    const result = CreateLogValidator.validate(valid);
    expect(result).toBeInstanceOf(CreateLogDto);
    expect(result.level).toBe("INFO");
    expect(result.message).toBe("hello");
    expect(result.service).toBe("svc");
  });

  it("throws ValidationError for invalid level", () => {
    const data = { level: "INVALID", message: "m" } as any;
    expect(() => CreateLogValidator.validate(data)).toThrow(ValidationError);
  });

  it("validateLogLevel works for correct level", () => {
    const level = CreateLogValidator.validateLogLevel("ERROR");
    expect(level).toBe("ERROR");
  });

  it("validateLogLevel throws for invalid level", () => {
    expect(() => CreateLogValidator.validateLogLevel("BOOM" as any)).toThrow(
      ValidationError,
    );
  });

  it("validateMessage enforces length and non-empty", () => {
    expect(() => CreateLogValidator.validateMessage("")).toThrow(
      ValidationError,
    );
    const msg = CreateLogValidator.validateMessage("ok message");
    expect(msg).toBe("ok message");
  });

  it("meta with >50 keys fails", () => {
    const bigMeta: Record<string, unknown> = {};
    for (let i = 0; i < 51; i++) bigMeta[`k${i}`] = i;
    expect(() =>
      CreateLogValidator.validate({
        level: "INFO",
        message: "m",
        meta: bigMeta,
      }),
    ).toThrow(ValidationError);
  });
});
