import { CryptoAdapter } from "@/infrastructure/adapters/crypto.adapter";
import { CryptoService } from "@/infrastructure/services/crypto/crypto.service";
import { BadRequestError } from "@/domain/errors/bad-request-error";

describe("CryptoService - passphrase protect/unprotect", () => {
  const passphrase = "test-passphrase-strong"; // >= 12 chars

  it("encryptPassPhrase and decryptPassPhrase round-trip DER", async () => {
    const adapter = new CryptoAdapter();
    const service = CryptoService.getInstance();

    const { privateKey } = await adapter.generateKeyPair();

    const privateDer = await adapter.exportPrivateKeyDer(privateKey);
    const protectedDer = service.encryptPassPhrase(passphrase, privateDer);

    expect(Buffer.isBuffer(protectedDer)).toBe(true);
    expect(protectedDer.length).toBeGreaterThan(0);

    const unprotectedDer = await service.decryptPassPhrase(
      passphrase,
      protectedDer,
    );

    // Expect same DER bytes after protect/unprotect
    expect(unprotectedDer.equals(privateDer)).toBe(true);
  });

  it("decryptPassPhrase fails with wrong passphrase", async () => {
    const adapter = new CryptoAdapter();
    const service = CryptoService.getInstance();

    const { privateKey } = await adapter.generateKeyPair();
    const privateDer = await adapter.exportPrivateKeyDer(privateKey);
    const protectedDer = service.encryptPassPhrase(passphrase, privateDer);

    await expect(
      service.decryptPassPhrase("wrong-passphrase", protectedDer),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});
