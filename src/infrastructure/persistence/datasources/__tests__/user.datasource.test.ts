import { UserDatasource } from "../user.datasource";
import { SyncUserFromAuthDto } from "@/domain/user/dtos/sync-user-from-auth.dto";
import { clearAllMocks } from "@/tests/test-utils";

describe("UserDatasource.upsertFromAuth", () => {
  const mockPrisma = {
    user: {
      upsert: jest.fn(),
    },
  } as const;

  const mockClient = {
    create: jest.fn(() => mockPrisma),
  } as const;

  afterEach(() => {
    clearAllMocks();
  });

  it("calls client.create and performs upsert with mapped fields", async () => {
    (mockPrisma.user.upsert as unknown as jest.Mock).mockResolvedValueOnce(
      undefined,
    );

    const [, dto] = SyncUserFromAuthDto.createFrom({
      id: "user-1",
      email: "user1@example.com",
      name: "John Doe",
      email_verified: true,
      phone: "+1234567890",
    });

    const datasource = new UserDatasource(
      mockClient as unknown as typeof import("@/infrastructure/persistence/database.client").DatabaseClient,
    );

    const result = await datasource.upsertFromAuth(dto!);

    expect(result).toBeUndefined();

    expect(mockClient.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.upsert).toHaveBeenCalledTimes(1);

    const callArg = (mockPrisma.user.upsert as unknown as jest.Mock).mock
      .calls[0][0];
    expect(callArg).toEqual(
      expect.objectContaining({
        where: { id: "user-1" },
        update: expect.objectContaining({
          email: "user1@example.com",
          role: "USER",
          profile: expect.objectContaining({
            name: "John Doe",
            emailVerified: true,
            phone: "+1234567890",
          }),
        }),
        create: expect.objectContaining({
          id: "user-1",
          email: "user1@example.com",
          role: "USER",
          profile: expect.objectContaining({
            name: "John Doe",
            emailVerified: true,
            phone: "+1234567890",
          }),
        }),
      }),
    );
  });

  it("propagates errors from prisma upsert", async () => {
    (mockPrisma.user.upsert as unknown as jest.Mock).mockRejectedValueOnce(
      new Error("db error"),
    );

    const [, dto] = SyncUserFromAuthDto.createFrom({
      id: "user-2",
      email: "user2@example.com",
    });

    const datasource = new UserDatasource(
      mockClient as unknown as typeof import("@/infrastructure/persistence/database.client").DatabaseClient,
    );

    await expect(datasource.upsertFromAuth(dto!)).rejects.toThrow("db error");
    expect(mockClient.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.upsert).toHaveBeenCalledTimes(1);
  });
});