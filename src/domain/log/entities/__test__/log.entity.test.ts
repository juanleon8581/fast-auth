import { LogEntity } from "@/domain/log/entities/log.entity";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";

describe("LogEntity", () => {
  it("createFrom builds entity and freezes it", () => {
    const now = new Date();
    const entity = LogEntity.createFrom({
      id: "id",
      level: "INFO",
      message: "m",
      timestamp: now,
      meta: { a: 1 },
      service: "svc",
      userId: "u",
      requestId: "r",
    });
    expect(entity).toBeInstanceOf(LogEntity);
    expect(Object.isFrozen(entity)).toBe(true);
    expect(entity.timestamp).toEqual(now);
  });

  it("accepts timestamp string parseable to Date", () => {
    const entity = LogEntity.createFrom({
      id: "id",
      level: "INFO",
      message: "m",
      timestamp: new Date().toISOString(),
    });
    expect(entity).toBeInstanceOf(LogEntity);
  });

  it("throws on missing required fields", () => {
    expect(() => LogEntity.createFrom({} as any)).toThrow(
      ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA,
    );
  });

  it("throws on invalid level", () => {
    expect(() =>
      LogEntity.createFrom({
        id: "id",
        level: "BAD",
        message: "m",
        timestamp: new Date(),
      } as any),
    ).toThrow(ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA);
  });

  it("throws on invalid timestamp", () => {
    expect(() =>
      LogEntity.createFrom({
        id: "id",
        level: "INFO",
        message: "m",
        timestamp: "not-a-date",
      }),
    ).toThrow(ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA);
  });
});
