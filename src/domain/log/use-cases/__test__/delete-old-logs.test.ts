import { DeleteOldLogs } from "@/domain/log/use-cases/delete-old-logs";
import { LogRepository } from "@/domain/log/repositories/log.repository";

describe("DeleteOldLogs UseCase", () => {
  it("delegates to repository.deleteOldLogs and returns count", async () => {
    const repo: LogRepository = {
      createLog: jest.fn(),
      getLogsByUserId: jest.fn(),
      getLogsByService: jest.fn(),
      getLogsByLevel: jest.fn(),
      getLogsByRequestId: jest.fn(),
      deleteOldLogs: jest.fn().mockResolvedValue(42),
    };

    const usecase = new DeleteOldLogs(repo);
    const result = await usecase.execute(7);

    expect(repo.deleteOldLogs).toHaveBeenCalledWith(7);
    expect(result).toBe(42);
  });

  it("throws error when days <= 0", async () => {
    const repo: LogRepository = {
      createLog: jest.fn(),
      getLogsByUserId: jest.fn(),
      getLogsByService: jest.fn(),
      getLogsByLevel: jest.fn(),
      getLogsByRequestId: jest.fn(),
      deleteOldLogs: jest.fn(),
    };

    const usecase = new DeleteOldLogs(repo);

    await expect(usecase.execute(0)).rejects.toThrow(
      "Days must be greater than 0",
    );
    await expect(usecase.execute(-1)).rejects.toThrow(
      "Days must be greater than 0",
    );
  });
});
