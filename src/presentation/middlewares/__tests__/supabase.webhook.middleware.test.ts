import { Request, Response, NextFunction } from "express";
import { SupabaseWebhookMiddleware } from "../supabase.webhook.middleware";
import { UnauthorizedError } from "@/domain/errors/unauthorized-error";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";

describe("SupabaseWebhookMiddleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { headers: {} } as any;
    mockRes = {} as any;
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call next with UnauthorizedError when headers are missing", () => {
    SupabaseWebhookMiddleware.handle(
      mockReq as Request,
      mockRes as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
    const err = (mockNext as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe(ERROR_MESSAGES.REQ_SIGN.UNKNOWN_ERROR);
  });

  it("should call next with UnauthorizedError when user-agent is invalid", () => {
    mockReq.headers = {
      "user-agent": "curl/8.0",
      "content-type": "application/json",
    } as any;

    SupabaseWebhookMiddleware.handle(
      mockReq as Request,
      mockRes as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
    const err = (mockNext as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe(ERROR_MESSAGES.REQ_SIGN.BAD_SIGNATURE);
  });

  it("should call next with UnauthorizedError when content-type is invalid", () => {
    mockReq.headers = {
      "user-agent": "pg_net/1.0",
      "content-type": "text/plain",
    } as any;

    SupabaseWebhookMiddleware.handle(
      mockReq as Request,
      mockRes as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
    const err = (mockNext as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe(ERROR_MESSAGES.REQ_SIGN.BAD_SIGNATURE);
  });

  it("should pass through when headers are valid", () => {
    mockReq.headers = {
      "user-agent": "pg_net/1.0",
      "content-type": "application/json",
    } as any;

    SupabaseWebhookMiddleware.handle(
      mockReq as Request,
      mockRes as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect((mockNext as jest.Mock).mock.calls[0][0]).toBeUndefined();
  });
});