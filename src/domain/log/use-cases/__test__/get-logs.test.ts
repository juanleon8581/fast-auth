import { GetLogs } from "@/domain/log/use-cases/get-logs";
import { LogRepository } from "@/domain/log/repositories/log.repository";
import { LogEntity } from "@/domain/entities/log.entity";

describe("GetLogs UseCase", () => {
  const sample = new LogEntity("INFO", "m", new Date(), "id");

  it("getByUserId delegates and returns logs", async () => {
    const repo: LogRepository = {
      createLog: jest.fn(),
      getLogsByUserId: jest.fn().mockResolvedValue([sample]),
      getLogsByService: jest.fn(),
      getLogsByLevel: jest.fn(),
      getLogsByRequestId: jest.fn(),
      deleteOldLogs: jest.fn(),
    };
    const usecase = new GetLogs(repo);
    const result = await usecase.getByUserId("u1", 5);
    expect(repo.getLogsByUserId).toHaveBeenCalledWith("u1", 5);
    expect(result).toEqual([sample]);
  });

  it("getByService delegates and returns logs", async () => {
    const repo: LogRepository = {
      createLog: jest.fn(),
      getLogsByUserId: jest.fn(),
      getLogsByService: jest.fn().mockResolvedValue([sample]),
      getLogsByLevel: jest.fn(),
      getLogsByRequestId: jest.fn(),
      deleteOldLogs: jest.fn(),
    };
    const usecase = new GetLogs(repo);
    const result = await usecase.getByService("svc", 10);
    expect(repo.getLogsByService).toHaveBeenCalledWith("svc", 10);
    expect(result).toEqual([sample]);
  });

  it("getByLevel delegates and returns logs", async () => {
    const repo: LogRepository = {
      createLog: jest.fn(),
      getLogsByUserId: jest.fn(),
      getLogsByService: jest.fn(),
      getLogsByLevel: jest.fn().mockResolvedValue([sample]),
      getLogsByRequestId: jest.fn(),
      deleteOldLogs: jest.fn(),
    };
    const usecase = new GetLogs(repo);
    const result = await usecase.getByLevel("INFO", 3);
    expect(repo.getLogsByLevel).toHaveBeenCalledWith("INFO", 3);
    expect(result).toEqual([sample]);
  });

  it("getByRequestId delegates and returns logs", async () => {
    const repo: LogRepository = {
      createLog: jest.fn(),
      getLogsByUserId: jest.fn(),
      getLogsByService: jest.fn(),
      getLogsByLevel: jest.fn(),
      getLogsByRequestId: jest.fn().mockResolvedValue([sample]),
      deleteOldLogs: jest.fn(),
    };
    const usecase = new GetLogs(repo);
    const result = await usecase.getByRequestId("req-1");
    expect(repo.getLogsByRequestId).toHaveBeenCalledWith("req-1");
    expect(result).toEqual([sample]);
  });
});
