import { LogDatasource } from "../log.datasource";
import { ValidationError } from "@/domain/errors/validation-error";
import { LogEntity } from "@/domain/entities/log.entity";
import { CreateLogDto } from "@/domain/dtos/create-log.dto";

// Mock DatabaseClient to return a fake Prisma client
const mockPrisma = {
  log: {
    create: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
};

jest.mock("@/infrastructure/config/database.client", () => ({
  DatabaseClient: {
    create: jest.fn(() => mockPrisma),
  },
}));

describe("LogDatasource", () => {
  let datasource: LogDatasource;

  beforeEach(() => {
    jest.clearAllMocks();
    datasource = LogDatasource.getInstance();
  });

  it("createLog maps and returns LogEntity", async () => {
    const now = new Date();
    const prismaLog = {
      id: "id-1",
      level: "ERROR",
      message: "m",
      timestamp: now,
      meta: { a: 1 },
      service: "svc",
      userId: "u1",
      requestId: "r1",
      error: null,
    };
    (mockPrisma.log.create as jest.Mock).mockResolvedValue(prismaLog);

    const dto = new CreateLogDto("ERROR", "m", { a: 1 }, "svc", "u1", "r1", undefined);
    const result = await datasource.createLog(dto);

    expect(mockPrisma.log.create).toHaveBeenCalled();
    expect(result).toBeInstanceOf(LogEntity);
    expect(result.id).toBe("id-1");
    expect(result.level).toBe("ERROR");
  });

  it("getLogsByLevel validates level", async () => {
    await expect(datasource.getLogsByLevel("BAD", 5)).rejects.toThrow(ValidationError);
  });

  it("getLogsByUserId validates empty userId", async () => {
    await expect(datasource.getLogsByUserId("", 5)).rejects.toThrow(ValidationError);
  });

  it("getLogsByService validates empty service", async () => {
    await expect(datasource.getLogsByService("", 5)).rejects.toThrow(ValidationError);
  });

  it("getLogsByRequestId validates empty requestId", async () => {
    await expect(datasource.getLogsByRequestId("")) .rejects.toThrow(ValidationError);
  });

  it("deleteOldLogs enforces range and calls deleteMany", async () => {
    await expect(datasource.deleteOldLogs(0)).rejects.toThrow(ValidationError);
    await expect(datasource.deleteOldLogs(366)).rejects.toThrow(ValidationError);

    (mockPrisma.log.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });
    const count = await datasource.deleteOldLogs(7);
    expect(mockPrisma.log.deleteMany).toHaveBeenCalled();
    expect(count).toBe(3);
  });

  it("mapToLogEntity converts Prisma level variants", async () => {
    (mockPrisma.log.findMany as jest.Mock).mockResolvedValue([
      { id: "1", level: "SILLY", message: "m", timestamp: new Date(), meta: {}, service: null, userId: null, requestId: null, error: null },
      { id: "2", level: "VERBOSE", message: "m", timestamp: new Date(), meta: {}, service: null, userId: null, requestId: null, error: null },
      { id: "3", level: "HTTP", message: "m", timestamp: new Date(), meta: {}, service: null, userId: null, requestId: null, error: null },
    ]);
    const res = await datasource.getLogsByService("svc");
    expect(res.length).toBe(3);
    expect(res[0]!.level).toBe("TRACE");
    expect(res[1]!.level).toBe("DEBUG");
    expect(res[2]!.level).toBe("INFO");
  });
});