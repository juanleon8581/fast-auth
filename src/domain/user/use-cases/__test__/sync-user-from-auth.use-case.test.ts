import { SyncUserFromAuth } from "../sync-user-from-auth";
import { UserRepository } from "@/domain/user/repositories/user.repository";
import { SyncUserFromAuthDto } from "@/domain/user/dtos/sync-user-from-auth.dto";
import { clearAllMocks } from "@/tests/test-utils";

describe("SyncUserFromAuth use case", () => {
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Create a minimal mock for the abstract repository
    mockRepository = {
      upsertFromAuth: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
  });

  afterEach(() => {
    clearAllMocks();
  });

  it("should call repository.upsertFromAuth with the provided DTO and resolve to void", async () => {
    // Arrange
    (mockRepository.upsertFromAuth as jest.Mock).mockResolvedValueOnce(
      undefined,
    );
    const useCase = new SyncUserFromAuth(mockRepository);
    const [, dto] = SyncUserFromAuthDto.createFrom({
      id: "user-1",
      email: "user@example.com",
      name: "John Doe",
    });

    // Act
    const result = await useCase.execute(dto!);

    // Assert
    expect(result).toBeUndefined();
    expect(mockRepository.upsertFromAuth).toHaveBeenCalledTimes(1);
    expect(mockRepository.upsertFromAuth).toHaveBeenCalledWith(dto);
  });

  it("should propagate errors from repository.upsertFromAuth", async () => {
    // Arrange
    const error = new Error("DB error");
    (mockRepository.upsertFromAuth as jest.Mock).mockRejectedValueOnce(error);
    const useCase = new SyncUserFromAuth(mockRepository);
    const [, dto] = SyncUserFromAuthDto.createFrom({
      id: "user-2",
      email: "user2@example.com",
    });

    // Act & Assert
    await expect(useCase.execute(dto!)).rejects.toThrow("DB error");
    expect(mockRepository.upsertFromAuth).toHaveBeenCalledTimes(1);
    expect(mockRepository.upsertFromAuth).toHaveBeenCalledWith(dto);
  });
});