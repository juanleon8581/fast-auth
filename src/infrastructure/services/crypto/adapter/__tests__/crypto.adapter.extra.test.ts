import { CryptoAdapter } from "@/infrastructure/services/crypto/adapter/crypto.adapter";
import { ValidationError } from "@/domain/errors/validation-error";
import { webcrypto } from "node:crypto";

describe("CryptoAdapter - comprehensive", () => {
  let adapter: CryptoAdapter;

  beforeEach(() => {
    adapter = new CryptoAdapter();
  });

  it("encryptPayload and decryptPayload round-trip", async () => {
    const symKey = await adapter.generateSymmetricKey(256);
    const plainText = "hello-world";
    const { cipherTextBase64url, ivBase64url } = await adapter.encryptPayload(
      plainText,
      symKey,
    );

    const decrypted = await adapter.decryptPayload(
      cipherTextBase64url,
      ivBase64url,
      symKey,
    );
    expect(decrypted).toBe(plainText);
  });

  it("decryptPayload throws on invalid iv length", async () => {
    const symKey = await adapter.generateSymmetricKey(256);
    const cipherTextBase64url = Buffer.from("cipher").toString("base64url");
    const badIv = Buffer.alloc(8).toString("base64url");
    await expect(
      adapter.decryptPayload(cipherTextBase64url, badIv, symKey),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      adapter.decryptPayload(cipherTextBase64url, badIv, symKey),
    ).rejects.toThrow("AES-GCM IV must be 12 bytes");
  });

  it("encryptPayload throws on empty plaintext", async () => {
    const symKey = await adapter.generateSymmetricKey(256);
    await expect(adapter.encryptPayload("", symKey)).rejects.toBeInstanceOf(
      ValidationError,
    );
    await expect(adapter.encryptPayload("", symKey)).rejects.toThrow(
      "Plain text is required",
    );
  });

  it("importPublicKey throws on invalid base64url", async () => {
    await expect(adapter.importPublicKey("!")).rejects.toBeInstanceOf(
      DOMException,
    );
    await expect(adapter.importPublicKey("!")).rejects.toMatchObject({
      name: expect.stringMatching(/DataError|OperationError|SyntaxError/),
    });
  });

  it("importPublicKey throws when base64url string is empty", async () => {
    await expect(adapter.importPublicKey("")).rejects.toBeInstanceOf(
      ValidationError,
    );
    await expect(adapter.importPublicKey("")).rejects.toThrow(
      "Base64url string is required",
    );
  });

  it("wrapKey and unwrapKey round-trip produces a working symmetric key", async () => {
    const { publicKey, privateKey } = await adapter.generateKeyPair();
    const symKey = await adapter.generateSymmetricKey(256);

    const { cipherTextBase64url, ivBase64url } = await adapter.encryptPayload(
      "payload-to-protect",
      symKey,
    );

    const wrapped = await adapter.wrapKey(symKey, publicKey);
    const wrappedBase64url = wrapped.toString("base64url");
    const unwrapped = await adapter.unwrapKey(wrappedBase64url, privateKey);

    const decrypted = await adapter.decryptPayload(
      cipherTextBase64url,
      ivBase64url,
      unwrapped,
    );
    expect(decrypted).toBe("payload-to-protect");
  });

  it("decryptEncKey recovers raw symmetric key bytes", async () => {
    const { publicKey, privateKey } = await adapter.generateKeyPair();
    const symKey = await adapter.generateSymmetricKey(256);

    const rawKey = Buffer.from(
      await webcrypto.subtle.exportKey("raw", symKey as unknown as CryptoKey),
    );

    const encKey = Buffer.from(
      await webcrypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, rawKey),
    );
    const encKeyBase64url = encKey.toString("base64url");

    const recovered = await adapter.decryptEncKey(encKeyBase64url, privateKey);
    expect(recovered.equals(rawKey)).toBe(true);
  });

  it("importSymmetricKey validates buffer length", async () => {
    await expect(adapter.importSymmetricKey(Buffer.alloc(0))).rejects.toThrow(
      ValidationError,
    );
    await expect(adapter.importSymmetricKey(Buffer.alloc(10))).rejects.toThrow(
      ValidationError,
    );

    // Valid lengths: 16, 24, 32
    const key16 = await adapter.importSymmetricKey(Buffer.alloc(16, 1));
    const key32 = await adapter.importSymmetricKey(Buffer.alloc(32, 2));
    expect(key16).toBeDefined();
    expect(key32).toBeDefined();
  });
});
