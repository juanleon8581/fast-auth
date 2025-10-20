import { CreateLogDto } from "../create-log.dto";
import { ERRORS } from "@/config/strings/global.strings.json";

describe("CreateLogDto", () => {
  it("createFrom returns dto for valid input", () => {
    const [err, dto] = CreateLogDto.createFrom({
      level: "INFO",
      message: " hello ",
      meta: { a: 1 },
      service: "svc",
      requestId: "r1",
    });
    expect(err).toBeUndefined();
    expect(dto).toBeInstanceOf(CreateLogDto);
    expect(dto!.message).toBe("hello");
  });

  it("invalid level returns error", () => {
    const [err] = CreateLogDto.createFrom({
      level: "BAD",
      message: "x",
    } as any);
    expect(err).toBe(ERRORS.DATA_VALIDATION.INVALID_DATA);
  });

  it("non-object meta returns error", () => {
    const [err] = CreateLogDto.createFrom({
      level: "INFO",
      message: "x",
      meta: 123 as any,
    });
    expect(err).toBe(ERRORS.DATA_VALIDATION.INVALID_DATA);
  });

  it("invalid string fields returns error", () => {
    const [err] = CreateLogDto.createFrom({
      level: "INFO",
      message: "x",
      userId: 123 as any,
    });
    expect(err).toBe(ERRORS.DATA_VALIDATION.INVALID_DATA);
  });
});
