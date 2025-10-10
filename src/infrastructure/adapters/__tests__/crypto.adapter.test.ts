import { CryptoAdapter } from "@/infrastructure/adapters/crypto.adapter";

describe("CryptoAdapter - RSA key generation and DER export", () => {
  it("generateKeyPair returns extractable keys and exports DER", async () => {
    const adapter = new CryptoAdapter();
    const { publicKey, privateKey } = await adapter.generateKeyPair();

    const publicDer = await adapter.exportPublicKeyDer(publicKey);
    const privateDer = await adapter.exportPrivateKeyDer(privateKey);

    expect(Buffer.isBuffer(publicDer)).toBe(true);
    expect(Buffer.isBuffer(privateDer)).toBe(true);
    expect(publicDer.length).toBeGreaterThan(0);
    expect(privateDer.length).toBeGreaterThan(0);
  });

  it("importPrivateKey round-trips DER correctly", async () => {
    const adapter = new CryptoAdapter();
    const { privateKey } = await adapter.generateKeyPair();

    const privateDer = await adapter.exportPrivateKeyDer(privateKey);
    const imported = await adapter.importPrivateKey(privateDer);
    const reExportedDer = await adapter.exportPrivateKeyDer(imported);

    expect(reExportedDer.equals(privateDer)).toBe(true);
  });
});