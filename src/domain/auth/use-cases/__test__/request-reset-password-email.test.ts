import { RequestResetPasswordEmail } from "../request-reset-password-email";
import { RequestResetPasswordEmailDto } from "../../dtos/request-reset-password-email.dto";
import { MockAuthRepository } from "@/tests/__mocks__/auth-repository.mock";

describe("RequestResetPasswordEmail", () => {
  let requestResetPasswordEmail: RequestResetPasswordEmail;
  let mockRepository: MockAuthRepository;

  beforeEach(() => {
    mockRepository = new MockAuthRepository();
    requestResetPasswordEmail = new RequestResetPasswordEmail(mockRepository);
  });

  describe("constructor", () => {
    it("should create RequestResetPasswordEmail instance with repository dependency", () => {
      expect(requestResetPasswordEmail).toBeInstanceOf(
        RequestResetPasswordEmail,
      );
      expect(requestResetPasswordEmail).toBeDefined();
    });

    it("should store repository reference", () => {
      // Access private property for testing
      expect((requestResetPasswordEmail as any).repository).toBe(
        mockRepository,
      );
    });
  });

  describe("execute", () => {
    it("should successfully request reset password email with valid data", async () => {
      const requestDto = new RequestResetPasswordEmailDto(
        "john@example.com",
        "https://example.com/reset-password",
      );

      const result = await requestResetPasswordEmail.execute(requestDto);

      expect(result).toBeUndefined(); // Method returns void
    });

    it("should successfully request reset password email with only email", async () => {
      const requestDto = new RequestResetPasswordEmailDto("jane@example.com");

      const result = await requestResetPasswordEmail.execute(requestDto);

      expect(result).toBeUndefined(); // Method returns void
    });

    it("should call repository requestResetPasswordEmail method with correct parameters", async () => {
      const requestDto = new RequestResetPasswordEmailDto(
        "test@example.com",
        "https://app.example.com/reset",
      );

      const repositorySpy = jest.spyOn(
        mockRepository,
        "requestResetPasswordEmail",
      );

      await requestResetPasswordEmail.execute(requestDto);

      expect(repositorySpy).toHaveBeenCalledTimes(1);
      expect(repositorySpy).toHaveBeenCalledWith(requestDto);
    });

    it("should propagate repository errors", async () => {
      const requestDto = new RequestResetPasswordEmailDto(
        "error@example.com",
        "https://example.com/reset",
      );

      mockRepository.setShouldFail(
        true,
        "Repository reset password email failed",
      );

      await expect(
        requestResetPasswordEmail.execute(requestDto),
      ).rejects.toThrow("Repository reset password email failed");
    });

    it("should handle different RequestResetPasswordEmailDto instances", async () => {
      const requestDto1 = new RequestResetPasswordEmailDto("user1@example.com");
      const requestDto2 = new RequestResetPasswordEmailDto(
        "user2@example.com",
        "https://different.com/reset",
      );

      const result1 = await requestResetPasswordEmail.execute(requestDto1);
      const result2 = await requestResetPasswordEmail.execute(requestDto2);

      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
    });

    it("should work with empty redirectTo", async () => {
      const requestDto = new RequestResetPasswordEmailDto(
        "test@example.com",
        "",
      );

      const result = await requestResetPasswordEmail.execute(requestDto);

      expect(result).toBeUndefined();
    });

    it("should work with null redirectTo", async () => {
      const requestDto = new RequestResetPasswordEmailDto(
        "test@example.com",
        null as any,
      );

      const result = await requestResetPasswordEmail.execute(requestDto);

      expect(result).toBeUndefined();
    });

    it("should work with undefined redirectTo", async () => {
      const requestDto = new RequestResetPasswordEmailDto(
        "test@example.com",
        undefined,
      );

      const result = await requestResetPasswordEmail.execute(requestDto);

      expect(result).toBeUndefined();
    });

    it("should handle repository method being called multiple times", async () => {
      const requestDto = new RequestResetPasswordEmailDto("multi@example.com");
      const repositorySpy = jest.spyOn(
        mockRepository,
        "requestResetPasswordEmail",
      );

      await requestResetPasswordEmail.execute(requestDto);
      await requestResetPasswordEmail.execute(requestDto);
      await requestResetPasswordEmail.execute(requestDto);

      expect(repositorySpy).toHaveBeenCalledTimes(3);
      expect(repositorySpy).toHaveBeenCalledWith(requestDto);
    });

    it("should maintain immutability of DTO during execution", async () => {
      const originalEmail = "immutable@example.com";
      const originalRedirectTo = "https://immutable.com/reset";
      const requestDto = new RequestResetPasswordEmailDto(
        originalEmail,
        originalRedirectTo,
      );

      await requestResetPasswordEmail.execute(requestDto);

      expect(requestDto.email).toBe(originalEmail);
      expect(requestDto.redirectTo).toBe(originalRedirectTo);
      expect(Object.isFrozen(requestDto)).toBe(true);
    });
  });
});
