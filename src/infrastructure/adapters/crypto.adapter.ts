import { subtle, createPrivateKey, KeyObject } from "node:crypto";

export class CryptoAdapter {
  async importPrivateKey(
    kid: string,
    privateKeyPem: string,
  ): Promise<CryptoKey> {
    const format = "pkcs8";
    const extractable = false;
    const keyUsages: KeyUsage[] = ["decrypt", "encrypt"];
    const pemOrKeyMaterial = Buffer.from(privateKeyPem, "base64");

    return subtle.importKey(
      format,
      pemOrKeyMaterial,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      extractable,
      keyUsages,
    );
  }

  async decryptEncKey(
    encKeyBase64url: string,
    privateKey: CryptoKey,
  ): Promise<ArrayBuffer> {
    const encKey = Buffer.from(encKeyBase64url, "base64");
    const decryptedKey = await subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      encKey,
    );
    return decryptedKey;
  }

  async importSymmetricKey(rawKey: ArrayBuffer): Promise<CryptoKey> {
    const key = await subtle.importKey(
      "raw",
      rawKey,
      {
        name: "AES-GCM",
      },
      false,
      ["encrypt", "decrypt"],
    );
    return key;
  }

  async decryptPayload(
    cipherTextBase64url: string,
    ivBase64url: string,
    symKey: CryptoKey,
  ): Promise<string> {
    const cipherText = Buffer.from(cipherTextBase64url, "base64");
    const iv = Buffer.from(ivBase64url, "base64");
    const decrypted = await subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      symKey,
      cipherText,
    );
    return new TextDecoder().decode(decrypted);
  }

  async exportPublicKeyPem(publicKey: CryptoKey): Promise<string> {
    const exportedKey = await subtle.exportKey("spki", publicKey);
    const pem = Buffer.from(exportedKey).toString("base64");
    return pem;
  }

  async exportPrivateKeyPem(privateKey: CryptoKey): Promise<string> {
    const exportedKey = await subtle.exportKey("pkcs8", privateKey);
    const pem = Buffer.from(exportedKey).toString("base64");
    return pem;
  }

  async generateKeyPair(): Promise<{
    publicKey: CryptoKey;
    privateKey: CryptoKey;
  }> {
    const keyPair = await subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"],
    );
    return keyPair;
  }

  async wrapKey(symKey: CryptoKey, publicKey: CryptoKey): Promise<ArrayBuffer> {
    const wrappedKey = await subtle.wrapKey("raw", symKey, publicKey, {
      name: "RSA-OAEP",
    });
    return wrappedKey;
  }

  createPrivateKey(privateKeyPem: string): KeyObject {
    const keyDer = Buffer.from(privateKeyPem, "base64");
    const privateKey = createPrivateKey({
      key: keyDer,
      format: "der",
      type: "pkcs8",
    });
    return privateKey;
  }
}
