// Removed unused BadRequestError import

describe("CryptoService - public key retrieval and key generation", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("getLatestPublicKeyBase64url throws when keys directory missing", () => {
    jest.doMock("@/config/envs", () => ({ __esModule: true, default: { PASSPHRASE: "pass" } }));
    jest.doMock("fs", () => ({
      __esModule: true,
      existsSync: jest.fn().mockReturnValue(false),
      readdirSync: jest.fn(),
      readFileSync: jest.fn(),
    }));
    const { CryptoService } = require("@/infrastructure/services/crypto.service");
    const service = CryptoService.getInstance();
    expect(() => service.getLatestPublicKeyBase64url()).toThrow(/Keys directory not found/);
  });

  it("getLatestPublicKeyBase64url throws when no public key files", () => {
    jest.doMock("@/config/envs", () => ({ __esModule: true, default: { PASSPHRASE: "pass" } }));
    jest.doMock("fs", () => ({
      __esModule: true,
      existsSync: jest.fn().mockReturnValue(true),
      readdirSync: jest.fn().mockReturnValue(["private-001.der", "notes.txt"]),
      readFileSync: jest.fn(),
    }));
    const { CryptoService } = require("@/infrastructure/services/crypto.service");
    const service = CryptoService.getInstance();
    expect(() => service.getLatestPublicKeyBase64url()).toThrow(/No public key found/);
  });

  it("getLatestPublicKeyBase64url returns base64url of latest public key", () => {
    jest.doMock("@/config/envs", () => ({ __esModule: true, default: { PASSPHRASE: "pass" } }));
    const der = Buffer.from("public-der-bytes");
    jest.doMock("fs", () => ({
      __esModule: true,
      existsSync: jest.fn().mockReturnValue(true),
      readdirSync: jest.fn().mockReturnValue([
        "public-2025-10-07-v1.der",
        "public-2025-10-08-v1.der",
      ]),
      readFileSync: jest.fn().mockImplementation((p: string) => {
        if (String(p).includes("2025-10-08")) return der;
        return Buffer.from("unexpected");
      }),
    }));
    const { CryptoService } = require("@/infrastructure/services/crypto.service");
    const service = CryptoService.getInstance();
    const base64url = service.getLatestPublicKeyBase64url();
    expect(base64url).toBe(der.toString("base64url"));
  });

  it("generateKeyPair skips when today's files already exist", async () => {
    // existsSync returns true for public/private paths to trigger skip
    const existsSync = jest.fn((p: string) => /public-|private-/.test(String(p)) || false);
    const mkdirSync = jest.fn();
    const writeFileSync = jest.fn();
    jest.doMock("fs", () => ({
      __esModule: true,
      existsSync,
      mkdirSync,
      writeFileSync,
      readdirSync: jest.fn(),
      readFileSync: jest.fn(),
    }));
    // Mock adapter to avoid real crypto work
    jest.doMock("@/infrastructure/adapters/crypto.adapter", () => ({
      __esModule: true,
      CryptoAdapter: class {
        async generateKeyPair() {
          return { publicKey: {} as any, privateKey: {} as any };
        }
        async exportPublicKeyDer() { return Buffer.from("pub-der"); }
        async exportPrivateKeyDer() { return Buffer.from("priv-der"); }
      },
    }));
    // Mock envs
    jest.doMock("@/config/envs", () => ({ __esModule: true, default: { PASSPHRASE: "pass" } }));
    const { CryptoService } = require("@/infrastructure/services/crypto.service");
    const service = CryptoService.getInstance();
    const spyProtect = jest
      .spyOn(CryptoService.prototype, "encryptPassPhrase")
      .mockReturnValue(Buffer.from("protected"));

    await service.generateKeyPair();

    // Should skip without writing
    expect(spyProtect).not.toHaveBeenCalled();
    expect(mkdirSync).not.toHaveBeenCalled();
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it("generateKeyPair writes protected private key and public key", async () => {
    const existsSync = jest.fn().mockReturnValue(false);
    const mkdirSync = jest.fn();
    const writeFileSync = jest.fn();
    jest.doMock("fs", () => ({
      __esModule: true,
      existsSync,
      mkdirSync,
      writeFileSync,
      readdirSync: jest.fn(),
      readFileSync: jest.fn(),
    }));
    jest.doMock("@/infrastructure/adapters/crypto.adapter", () => ({
      __esModule: true,
      CryptoAdapter: class {
        async generateKeyPair() {
          return { publicKey: {} as any, privateKey: {} as any };
        }
        async exportPublicKeyDer() { return Buffer.from("pub-der"); }
        async exportPrivateKeyDer() { return Buffer.from("priv-der"); }
      },
    }));
    jest.doMock("@/config/envs", () => ({ __esModule: true, default: { PASSPHRASE: "pass" } }));

    const { CryptoService } = require("@/infrastructure/services/crypto.service");
    const service = CryptoService.getInstance();
    jest
      .spyOn(CryptoService.prototype, "encryptPassPhrase")
      .mockReturnValue(Buffer.from("protected"));

    await service.generateKeyPair();

    expect(mkdirSync).toHaveBeenCalled();
    // Two writes: public and private
    expect(writeFileSync).toHaveBeenCalledTimes(2);
    const calls = (writeFileSync as jest.Mock).mock.calls;
    expect(calls[0][0]).toContain("public-");
    expect(Buffer.isBuffer(calls[0][1])).toBe(true);
    expect(calls[1][0]).toContain("private-");
    // Protected DER written
    expect(calls[1][1]).toEqual(Buffer.from("protected"));
  });

  it("generateKeyPair throws BadRequestError on IO error", async () => {
    const existsSync = jest.fn().mockReturnValue(false);
    const mkdirSync = jest.fn();
    const writeFileSync = jest.fn(() => { throw new Error("IO"); });
    jest.doMock("fs", () => ({
      __esModule: true,
      existsSync,
      mkdirSync,
      writeFileSync,
      readdirSync: jest.fn(),
      readFileSync: jest.fn(),
    }));
    jest.doMock("@/infrastructure/adapters/crypto.adapter", () => ({
      __esModule: true,
      CryptoAdapter: class {
        async generateKeyPair() { return { publicKey: {} as any, privateKey: {} as any }; }
        async exportPublicKeyDer() { return Buffer.from("pub-der"); }
        async exportPrivateKeyDer() { return Buffer.from("priv-der"); }
      },
    }));
    jest.doMock("@/config/envs", () => ({ __esModule: true, default: { PASSPHRASE: "pass" } }));

    const { CryptoService } = require("@/infrastructure/services/crypto.service");
    const service = CryptoService.getInstance();
    jest
      .spyOn(CryptoService.prototype, "encryptPassPhrase")
      .mockReturnValue(Buffer.from("protected"));

    await expect(service.generateKeyPair()).rejects.toEqual(
      expect.objectContaining({ name: "BadRequestError" })
    );
  });
});