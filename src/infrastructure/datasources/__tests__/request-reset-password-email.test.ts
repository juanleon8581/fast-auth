import { AuthDatasource } from "../auth.datasource";
import { AuthClient } from "@/infrastructure/config/auth.client";
import { RequestResetPasswordEmailDto } from "@/domain/auth/dtos/request-reset-password-email.dto";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { ERRORS } from "@/config/strings/global.strings.json";

// Mock dependencies
jest.mock("@/infrastructure/config/auth.client");

const MockedAuthClient = AuthClient as jest.MockedClass<typeof AuthClient>;

// Mock data factory
const createMockRequestResetPasswordEmailDto =
  (): RequestResetPasswordEmailDto =>
    ({
      email: "john.doe@example.com",
      redirectTo: "https://example.com/reset-password",
    }) as RequestResetPasswordEmailDto;

const createMockSupabaseError = (message: string = "Supabase error") => ({
  message,
  code: "auth_error",
  status: 400,
});

describe("AuthDatasource - RequestResetPasswordEmail Functionality", () => {
  let authDatasource: AuthDatasource;
  let mockSupabaseClient: any;
  let mockAuthClient: any;
  let mockRequestResetPasswordEmailDto: RequestResetPasswordEmailDto;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabaseClient = {
      auth: {
        resetPasswordForEmail: jest.fn(),
      },
    };

    // Create mock AuthClient
    mockAuthClient = {
      create: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    MockedAuthClient.mockImplementation(() => mockAuthClient);

    // Create test data
    mockRequestResetPasswordEmailDto = createMockRequestResetPasswordEmailDto();

    // Create instance after mocks are set up
    authDatasource = new AuthDatasource(MockedAuthClient);
  });

  describe("constructor", () => {
    it("should create AuthDatasource instance", () => {
      expect(authDatasource).toBeInstanceOf(AuthDatasource);
    });

    it("should initialize AuthClient", () => {
      expect(authDatasource).toHaveProperty("client");
    });
  });

  describe("requestResetPasswordEmail method", () => {
    describe("successful password reset email request", () => {
      beforeEach(() => {
        mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
          data: {},
          error: null,
        });
      });

      it("should call Supabase resetPasswordForEmail with correct parameters", async () => {
        await authDatasource.requestResetPasswordEmail(
          mockRequestResetPasswordEmailDto,
        );

        expect(
          mockSupabaseClient.auth.resetPasswordForEmail,
        ).toHaveBeenCalledWith(mockRequestResetPasswordEmailDto.email, {
          redirectTo: mockRequestResetPasswordEmailDto.redirectTo,
        });
      });

      it("should call resetPasswordForEmail with email only when redirectTo is not provided", async () => {
        const dtoWithoutRedirectTo = {
          email: "john.doe@example.com",
        } as RequestResetPasswordEmailDto;

        await authDatasource.requestResetPasswordEmail(dtoWithoutRedirectTo);

        expect(
          mockSupabaseClient.auth.resetPasswordForEmail,
        ).toHaveBeenCalledWith(dtoWithoutRedirectTo.email, {
          redirectTo: undefined,
        });
      });

      it("should create AuthClient and call create method", async () => {
        await authDatasource.requestResetPasswordEmail(
          mockRequestResetPasswordEmailDto,
        );

        expect(MockedAuthClient).toHaveBeenCalled();
        expect(mockAuthClient.create).toHaveBeenCalled();
      });

      it("should return void on successful password reset email request", async () => {
        const result = await authDatasource.requestResetPasswordEmail(
          mockRequestResetPasswordEmailDto,
        );

        expect(result).toBeUndefined();
      });
    });

    describe("error scenarios", () => {
      it("should throw BadRequestError when Supabase returns an error", async () => {
        const supabaseError = createMockSupabaseError("Email not found");
        mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
          data: null,
          error: supabaseError,
        });

        await expect(
          authDatasource.requestResetPasswordEmail(
            mockRequestResetPasswordEmailDto,
          ),
        ).rejects.toThrow(BadRequestError);

        await expect(
          authDatasource.requestResetPasswordEmail(
            mockRequestResetPasswordEmailDto,
          ),
        ).rejects.toThrow(
          ERRORS.AUTH.REQUEST_RESET_PASSWORD_EMAIL.EMAIL_NOT_SENT,
        );
      });

      it("should throw BadRequestError when resetPasswordForEmail throws an exception", async () => {
        mockSupabaseClient.auth.resetPasswordForEmail.mockRejectedValue(
          new Error("Network error"),
        );

        await expect(
          authDatasource.requestResetPasswordEmail(
            mockRequestResetPasswordEmailDto,
          ),
        ).rejects.toThrow(BadRequestError);

        await expect(
          authDatasource.requestResetPasswordEmail(
            mockRequestResetPasswordEmailDto,
          ),
        ).rejects.toThrow(
          ERRORS.AUTH.REQUEST_RESET_PASSWORD_EMAIL.EMAIL_NOT_SENT,
        );
      });

      it("should handle AuthClient creation failure", async () => {
        MockedAuthClient.mockImplementation(() => {
          throw new Error("Failed to create AuthClient");
        });

        await expect(
          authDatasource.requestResetPasswordEmail(
            mockRequestResetPasswordEmailDto,
          ),
        ).rejects.toThrow(BadRequestError);

        await expect(
          authDatasource.requestResetPasswordEmail(
            mockRequestResetPasswordEmailDto,
          ),
        ).rejects.toThrow(
          ERRORS.AUTH.REQUEST_RESET_PASSWORD_EMAIL.EMAIL_NOT_SENT,
        );
      });
    });

    describe("edge cases", () => {
      it("should handle empty email gracefully", async () => {
        const dtoWithEmptyEmail = {
          email: "",
          redirectTo: "https://example.com/reset-password",
        } as RequestResetPasswordEmailDto;

        mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
          data: {},
          error: null,
        });

        await authDatasource.requestResetPasswordEmail(dtoWithEmptyEmail);

        expect(
          mockSupabaseClient.auth.resetPasswordForEmail,
        ).toHaveBeenCalledWith("", {
          redirectTo: "https://example.com/reset-password",
        });
      });

      it("should handle very long redirectTo URL", async () => {
        const longUrl = "https://example.com/" + "a".repeat(1000);
        const dtoWithLongUrl = {
          email: "john.doe@example.com",
          redirectTo: longUrl,
        } as RequestResetPasswordEmailDto;

        mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
          data: {},
          error: null,
        });

        await authDatasource.requestResetPasswordEmail(dtoWithLongUrl);

        expect(
          mockSupabaseClient.auth.resetPasswordForEmail,
        ).toHaveBeenCalledWith("john.doe@example.com", {
          redirectTo: longUrl,
        });
      });
    });
  });
});
