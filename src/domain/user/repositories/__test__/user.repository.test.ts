import { UserRepository } from "../user.repository";
import { SyncUserFromAuthDto } from "@/domain/user/dtos/sync-user-from-auth.dto";
import { clearAllMocks } from "@/tests/test-utils";

class FakeUserRepository extends UserRepository {
  async upsertFromAuth(input: SyncUserFromAuthDto): Promise<void> {
    // no-op implementation for testing contract
    void input; // mark parameter as used to satisfy lint rules
    return;
  }
}

describe("UserRepository (abstract contract)", () => {
  afterEach(() => {
    clearAllMocks();
  });

  it("should allow subclass implementation and call upsertFromAuth with a valid DTO", async () => {
    const repo = new FakeUserRepository();
    const spy = jest.spyOn(repo, "upsertFromAuth");

    const [err, dto] = SyncUserFromAuthDto.createFrom({
      id: "user-1",
      email: "user@example.com",
    });

    expect(err).toBeUndefined();
    expect(dto).toBeDefined();

    await repo.upsertFromAuth(dto!);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(dto);
  });

  it("should resolve to void (undefined)", async () => {
    const repo = new FakeUserRepository();

    const [, dto] = SyncUserFromAuthDto.createFrom({
      id: "user-2",
      email: "user2@example.com",
    });

    const result = await repo.upsertFromAuth(dto!);
    expect(result).toBeUndefined();
  });

  it("should propagate errors from the concrete implementation", async () => {
    const repo = new FakeUserRepository();
    const spy = jest
      .spyOn(repo, "upsertFromAuth")
      .mockRejectedValueOnce(new Error("DB error"));

    const [, dto] = SyncUserFromAuthDto.createFrom({
      id: "user-3",
      email: "user3@example.com",
    });

    await expect(repo.upsertFromAuth(dto!)).rejects.toThrow("DB error");
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
