describe("CryptoMiddleware.decrypt", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("when encryption enabled, decrypts body and calls next", async () => {
    // Mock config to force encryption
    jest.doMock("@/infrastructure/config/crypto/crypto.config", () => ({
      __esModule: true,
      default: {
        keysPath: "./.keys",
        cryptoEnvironment: ["prod", "qa"],
        forceEncrypt: true,
        disabledEncrypt: false,
      },
    }));

    // Mock CryptoService to avoid filesystem
    const privateKeyDer = Buffer.from("pkcs8-der");
    const getInstanceMock = {
      getLatestPrivateKeyBase64url: jest.fn().mockResolvedValue(privateKeyDer),
    } as any;
    jest.doMock("@/infrastructure/services/crypto/crypto.service", () => ({
      __esModule: true,
      CryptoService: class {
        static getInstance() {
          return getInstanceMock;
        }
      },
    }));

    // Mock DecryptPayloadUseCase to return payload
    const decryptedPayload = { user: "john" };
    const executeMock = jest.fn().mockResolvedValue(decryptedPayload);
    jest.doMock("@/domain/crypto/use-cases/decrypt-payload.usecase", () => ({
      __esModule: true,
      DecryptPayloadUseCase: class {
        constructor() {}
        execute = executeMock;
      },
    }));

    // Mock validator to return DTO-like object
    const dtoMock = {
      encryptedPayload: "a",
      encryption: { iv: "b", wrappedKey: "c" },
    } as any;
    jest.doMock(
      "@/infrastructure/services/crypto/validators/encrypted-body.validator",
      () => ({
        __esModule: true,
        EncryptedBodyValidator: {
          validate: jest.fn().mockReturnValue(dtoMock),
        },
      }),
    );

    const { CryptoMiddleware } = require("../crypto.middleware");

    const req: any = { body: { some: "encrypted" } };
    const res: any = {};
    const next = jest.fn();

    await CryptoMiddleware.decrypt(req, res, next);

    expect(getInstanceMock.getLatestPrivateKeyBase64url).toHaveBeenCalledTimes(
      1,
    );
    expect(executeMock).toHaveBeenCalledTimes(1);
    expect(req.body).toEqual(decryptedPayload);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("when encryption disabled, skips decryption and calls next", async () => {
    // Mock config to disable encryption and not force
    jest.doMock("@/infrastructure/config/crypto/crypto.config", () => ({
      __esModule: true,
      default: {
        keysPath: "./.keys",
        cryptoEnvironment: ["prod", "qa"],
        forceEncrypt: false,
        disabledEncrypt: true,
      },
    }));

    // Keep other modules real but ensure use-case would not be invoked
    const usecaseModule = jest.createMockFromModule(
      "@/domain/crypto/use-cases/decrypt-payload.usecase",
    ) as any;
    usecaseModule.DecryptPayloadUseCase = class {
      execute() {
        throw new Error("Should not be called when encryption disabled");
      }
    };
    jest.doMock(
      "@/domain/crypto/use-cases/decrypt-payload.usecase",
      () => usecaseModule,
    );

    const { CryptoMiddleware } = require("../crypto.middleware");

    const initialBody = { some: "encrypted" };
    const req: any = { body: { ...initialBody } };
    const res: any = {};
    const next = jest.fn();

    await CryptoMiddleware.decrypt(req, res, next);

    expect(req.body).toEqual(initialBody);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
