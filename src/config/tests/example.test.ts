import {
  clearAllMocks,
  mockUser,
  generateMockToken,
} from "@/config/tests/test-utils";

describe("Jest Configuration", () => {
  afterEach(() => {
    clearAllMocks();
  });

  it("should run a basic test", () => {
    expect(true).toBe(true);
  });

  it("should be able to use test helpers", () => {
    const token = generateMockToken();

    expect(token).toHaveProperty("access_token");
    expect(token).toHaveProperty("refresh_token");
    expect(token).toHaveProperty("expires_in");
    expect(token).toHaveProperty("user");
    expect(token.user).toEqual(mockUser);
  });

  it("should be able to use test environment variables", () => {
    expect(process.env.NODE_ENV).toBe("test");
    expect(process.env.PORT).toBe("3001");
    expect(process.env.SUPABASE_URL).toBe("https://test.supabase.co");
  });

  it("should be able to make basic assertions", () => {
    const testObject = {
      name: "Test",
      value: 42,
      active: true,
    };

    expect(testObject.name).toBe("Test");
    expect(testObject.value).toBeGreaterThan(40);
    expect(testObject.active).toBeTruthy();
    expect(testObject).toHaveProperty("name");
  });
});
