import { CryptoAdapter } from "@/infrastructure/services/crypto/adapter/crypto.adapter";
import { CryptoService } from "@/infrastructure/services/crypto/crypto.service";

describe("CryptoService - decryptPayload end-to-end", () => {
  it("decryptPayload returns original JSON payload", async () => {
    const adapter = new CryptoAdapter();
    const service = CryptoService.getInstance();

    // Generate RSA key pair and export DERs
    const { publicKey, privateKey } = await adapter.generateKeyPair();
    const publicDer = await adapter.exportPublicKeyDer(publicKey);
    const privateDer = await adapter.exportPrivateKeyDer(privateKey);

    // Import public key from DER base64url
    const publicDerBase64url = publicDer.toString("base64url");
    const importedPublicKey = await adapter.importPublicKey(publicDerBase64url);

    // Generate symmetric key and encrypt a JSON payload
    const symKey = await adapter.generateSymmetricKey(256);
    const originalPayload = { ok: true, msg: "hola" };
    const plainText = JSON.stringify(originalPayload);
    const { cipherTextBase64url, ivBase64url } = await adapter.encryptPayload(
      plainText,
      symKey,
    );

    // Wrap the symmetric key with RSA-OAEP using the public key
    const wrappedKeyBuffer = await adapter.wrapKey(symKey, importedPublicKey);
    const wrappedKeyBase64url = wrappedKeyBuffer.toString("base64url");

    // Decrypt payload using CryptoService and the private key DER
    const result = await service.decryptPayload(
      cipherTextBase64url,
      ivBase64url,
      wrappedKeyBase64url,
      privateDer,
    );

    expect(result).toEqual(originalPayload);
  });
});
