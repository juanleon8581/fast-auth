import { CreateLog } from "../create-log";
import { LogRepository } from "@/domain/log/repositories/log.repository";
import { CreateLogDto } from "@/domain/log/dtos/create-log.dto";
import { LogEntity } from "@/domain/log/entities/log.entity";

describe("CreateLog UseCase", () => {
  it("delegates to repository.createLog and returns LogEntity", async () => {
    const now = new Date();
    const dto = new CreateLogDto(
      "INFO",
      "message",
      { a: 1 },
      "svc",
      "u1",
      "r1",
      undefined,
    );

    const expected = new LogEntity(
      "INFO",
      "message",
      now,
      "id-1",
      { a: 1 },
      "svc",
      "u1",
      "r1",
      undefined,
    );

    const repo: LogRepository = {
      createLog: jest.fn().mockResolvedValue(expected),
      getLogsByUserId: jest.fn(),
      getLogsByService: jest.fn(),
      getLogsByLevel: jest.fn(),
      getLogsByRequestId: jest.fn(),
      deleteOldLogs: jest.fn(),
    };

    const usecase = new CreateLog(repo);
    const result = await usecase.execute(dto);

    expect(repo.createLog).toHaveBeenCalledWith(dto);
    expect(result).toBe(expected);
    expect(result).toBeInstanceOf(LogEntity);
  });
});
