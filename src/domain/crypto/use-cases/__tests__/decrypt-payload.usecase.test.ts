import { DecryptPayloadUseCase } from "@/domain/crypto/use-cases/decrypt-payload.usecase";
import { CryptoRepository } from "@/domain/crypto/repositories/crypto.repository";
import { EncryptedBodyDto } from "@/domain/crypto/dtos/encrypted-body.dto";

class MockCryptoRepository extends CryptoRepository {
  encryptPassPhrase(): Buffer {
    return Buffer.alloc(0);
  }
  decryptPassPhrase(): Promise<Buffer> {
    return Promise.resolve(Buffer.alloc(0));
  }
  generateKeyPair(): Promise<void> {
    return Promise.resolve();
  }
  getLatestPublicKeyBase64url(): string {
    return "";
  }
  getLatestPrivateKeyBase64url(): Promise<Buffer> {
    return Promise.resolve(Buffer.alloc(0));
  }
  decryptPayload = jest
    .fn<Promise<Record<string, unknown>>, [string, string, string, Buffer]>()
    .mockResolvedValue({ ok: true });
}

describe("DecryptPayloadUseCase", () => {
  let useCase: DecryptPayloadUseCase;
  let repository: MockCryptoRepository;

  const dto = new EncryptedBodyDto(
    {
      alg: "RSA-OAEP",
      hash: "SHA-256",
      enc: "AES-GCM",
      kid: "public-key-001.der",
      iv: Buffer.alloc(12, 1).toString("base64url"),
      wrappedKey: Buffer.from("wrapped-key").toString("base64url"),
    },
    {
      alg: "HS256",
      value: Buffer.from("sig").toString("base64url"),
      timestamp: new Date(),
    },
    Buffer.from("cipher-text").toString("base64url"),
  );

  const privateKey = Buffer.from("private-key-der");

  beforeEach(() => {
    repository = new MockCryptoRepository();
    useCase = new DecryptPayloadUseCase(repository);
  });

  it("should call repository.decryptPayload with correct arguments", async () => {
    await useCase.execute(dto, privateKey);

    expect(repository.decryptPayload).toHaveBeenCalledTimes(1);
    expect(repository.decryptPayload).toHaveBeenCalledWith(
      dto.encryptedPayload,
      dto.encryption.iv,
      dto.encryption.wrappedKey,
      privateKey,
    );
  });

  it("should return decrypted payload from repository", async () => {
    const result = await useCase.execute(dto, privateKey);
    expect(result).toEqual({ ok: true });
  });
});
