import { Request, Response, NextFunction } from "express";
import { UserWebhookController } from "../user-webhook.controller";
import { AuthTableWebhookValidator } from "@/infrastructure/external/auth/validators/auth-table-webhook.validator";
import { SyncUserFromAuthDto } from "@/domain/user/dtos/sync-user-from-auth.dto";
import { SyncUserFromAuth } from "@/domain/user/use-cases/sync-user-from-auth";

jest.mock("@/domain/user/use-cases/sync-user-from-auth");

describe("UserWebhookController", () => {
  let controller: UserWebhookController;
  const mockDatasource = {} as any; // Repository is not used directly here

  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new UserWebhookController(mockDatasource);

    mockReq = {
      body: { some: "payload" },
      requestId: "test-request-id",
    } as any;

    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    mockRes = { status, json } as any;

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("handleAuthUserCreated", () => {
    it("should validate payload, execute use case and return success response", async () => {
      const dto = {
        id: "uuid-123",
        email: "user@example.com",
        name: "User",
        email_verified: true,
        phone: "+1234567890",
      } as unknown as SyncUserFromAuthDto;
      jest.spyOn(AuthTableWebhookValidator, "validate").mockReturnValue(dto);

      const execute = jest.fn().mockResolvedValue(undefined);
      (SyncUserFromAuth as unknown as jest.Mock).mockImplementation(() => ({
        execute,
      }));

      controller.handleAuthUserCreated(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Esperar a que termine el then del controlador
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(AuthTableWebhookValidator.validate).toHaveBeenCalledWith(
        mockReq.body,
      );
      expect(SyncUserFromAuth).toHaveBeenCalledWith(mockDatasource);
      expect(execute).toHaveBeenCalledWith(dto);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: { message: "User synced successfully" },
          meta: {
            requestId: "test-request-id",
            timestamp: expect.any(String),
            version: "1.0.0",
          },
        }),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next when validation fails", () => {
      const error = new Error("Invalid webhook data");
      jest
        .spyOn(AuthTableWebhookValidator, "validate")
        .mockImplementation(() => {
          throw error;
        });

      controller.handleAuthUserCreated(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should call next when use case execution fails", async () => {
      const dto = {
        id: "uuid-123",
        email: "user@example.com",
        name: "User",
        email_verified: true,
        phone: "+1234567890",
      } as unknown as SyncUserFromAuthDto;
      jest.spyOn(AuthTableWebhookValidator, "validate").mockReturnValue(dto);

      const error = new Error("Sync failed");
      const execute = jest.fn().mockRejectedValue(error);
      (SyncUserFromAuth as unknown as jest.Mock).mockImplementation(() => ({
        execute,
      }));

      controller.handleAuthUserCreated(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});