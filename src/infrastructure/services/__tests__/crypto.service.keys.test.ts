describe("CryptoService - getLatestPrivateKeyBase64url", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("throws when keys directory is missing", async () => {
    jest.doMock("@/config/envs", () => ({
      __esModule: true,
      default: { PASSPHRASE: "test-passphrase" },
    }));
    jest.doMock("fs", () => ({
      __esModule: true,
      existsSync: jest.fn().mockReturnValue(false),
      readdirSync: jest.fn(),
      readFileSync: jest.fn(),
    }));

    const { CryptoService } = require("@/infrastructure/services/crypto.service");
    const service = CryptoService.getInstance();

    await expect(service.getLatestPrivateKeyBase64url()).rejects.toThrow(
      /Keys directory not found/,
    );
  });

  it("throws when no private key files found", async () => {
    jest.doMock("@/config/envs", () => ({
      __esModule: true,
      default: { PASSPHRASE: "test-passphrase" },
    }));
    jest.doMock("fs", () => ({
      __esModule: true,
      existsSync: jest.fn().mockReturnValue(true),
      readdirSync: jest.fn().mockReturnValue(["public-123.der", "notes.txt"]),
      readFileSync: jest.fn(),
    }));

    const { CryptoService } = require("@/infrastructure/services/crypto.service");
    const service = CryptoService.getInstance();

    await expect(service.getLatestPrivateKeyBase64url()).rejects.toThrow(
      /No private key found/,
    );
  });

  it("reads latest private key and returns decrypted DER buffer", async () => {
    const derProtected = Buffer.from("protected-der");
    jest.doMock("fs", () => ({
      __esModule: true,
      existsSync: jest.fn().mockReturnValue(true),
      readdirSync: jest.fn().mockReturnValue([
        "private-001.der",
        "private-002.der",
        "public-abc.der",
      ]),
      readFileSync: jest.fn().mockImplementation((p: string) => {
        if (String(p).includes("private-002.der")) return derProtected;
        return Buffer.from("unexpected");
      }),
    }));

    // Mock envs for passphrase usage
    jest.doMock("@/config/envs", () => ({
      __esModule: true,
      default: { PASSPHRASE: "test-passphrase" },
    }));

    const { CryptoService } = require("@/infrastructure/services/crypto.service");
    const service = CryptoService.getInstance();

    // Spy and stub decryptPassPhrase to avoid actual crypto
    const decrypted = Buffer.from("decrypted-der");
    const spy = jest
      .spyOn(require("@/infrastructure/services/crypto.service").CryptoService.prototype, "decryptPassPhrase")
      .mockResolvedValue(decrypted);

    const result = await service.getLatestPrivateKeyBase64url();

    expect(spy).toHaveBeenCalledWith("test-passphrase", derProtected);
    expect(result).toBe(decrypted);
  });
});