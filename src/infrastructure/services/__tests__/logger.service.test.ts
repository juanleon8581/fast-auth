import { LoggerService } from "../logger.service";

// Mocks
jest.mock("@/config/envs", () => ({
  __esModule: true,
  default: { NODE_ENV: "dev" },
}));

const mockExecute = jest.fn().mockResolvedValue(undefined);

jest.mock("@/domain/use-cases/create-log", () => ({
  CreateLog: jest.fn().mockImplementation(() => ({
    execute: mockExecute,
  })),
}));

jest.mock("@/domain/dtos/create-log.dto", () => {
  const actual = jest.requireActual("@/domain/dtos/create-log.dto");
  return {
    __esModule: true,
    ...actual,
    CreateLogDto: {
      ...actual.CreateLogDto,
      createFrom: jest.fn((data: any) => [undefined, new actual.CreateLogDto(
        data.level,
        data.message,
        data.meta,
        data.service,
        undefined,
        data.requestId,
        data.error,
      )]),
    },
  };
});

describe("LoggerService", () => {
  const makeReq = (overrides: any = {}) => ({
    method: "GET",
    path: "/p",
    url: "/p",
    ip: "127.0.0.1",
    httpVersion: "1.1",
    get: jest.fn().mockReturnValue("UA"),
    requestId: "req-1",
    ...overrides,
  });
  const makeRes = (overrides: any = {}) => ({ statusCode: 200, ...overrides });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logError calls CreateLog.execute in dev", () => {
    const req = makeReq();
    const res = makeRes();
    LoggerService.logError({ error: new Error("boom"), req, res, service: "svc" });
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it("logWarn calls CreateLog.execute in dev", () => {
    const req = makeReq();
    const res = makeRes();
    LoggerService.logWarn({ error: new Error("boom"), req, res, service: "svc" });
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it("logInfo calls in dev", () => {
    const req = makeReq();
    const res = makeRes();
    LoggerService.logInfo({ message: "m", req, res, service: "svc" });
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it("logDebug calls in dev", () => {
    const req = makeReq();
    LoggerService.logDebug({ message: "m", req, service: "svc" });
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it("skips non-prod levels when NODE_ENV=prod", () => {
    jest.resetModules();
    jest.doMock("@/config/envs", () => ({ __esModule: true, default: { NODE_ENV: "prod" } }));
    jest.isolateModules(() => {
      const { LoggerService: ProdLogger } = require("../logger.service");
      const req = makeReq();
      ProdLogger.logInfo({ message: "m", req, res: makeRes(), service: "svc" });
      ProdLogger.logDebug({ message: "m", req, service: "svc" });
      expect(mockExecute).toHaveBeenCalledTimes(0);
      ProdLogger.logError({ error: new Error("e"), req, res: makeRes(), service: "svc" });
      ProdLogger.logWarn({ error: new Error("w"), req, res: makeRes(), service: "svc" });
      expect(mockExecute).toHaveBeenCalledTimes(2);
    });
  });
});