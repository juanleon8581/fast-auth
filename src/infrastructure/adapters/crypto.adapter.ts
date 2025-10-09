import { webcrypto, createPrivateKey, KeyObject } from "node:crypto";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { ValidationError } from "@/domain/errors/validation-error";

export class CryptoAdapter {
  /**
   * Utility: Convert Buffer to base64url string.
   */
  private toStringBase64Url(buffer: Buffer): string {
    return buffer.toString("base64url");
  }

  /**
   * Utility: Convert base64url string to Buffer. Throws on invalid input.
   */
  private fromStringBase64Url(base64url: string): Buffer {
    if (typeof base64url !== "string" || base64url.length === 0) {
      throw new ValidationError(
        "Base64url string is required",
        "base64url",
        "REQUIRED_FIELD",
      );
    }
    try {
      return Buffer.from(base64url, "base64url");
    } catch {
      throw new BadRequestError(
        "Invalid base64url input",
        "base64url",
        "INVALID_BASE64URL",
      );
    }
  }

  /**
   * Import a PKCS8 private key from base64url DER.
   */
  async importPrivateKey(privateKey: Buffer): Promise<CryptoKey> {
    const format = "pkcs8";
    const extractable = true;
    const keyUsages: KeyUsage[] = ["decrypt", "unwrapKey"];

    return webcrypto.subtle.importKey(
      format,
      privateKey,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      extractable,
      keyUsages,
    );
  }

  /**
   * Import a SPKI public key from base64url DER.
   */
  async importPublicKey(publicKey: string): Promise<CryptoKey> {
    const format = "spki";
    const extractable = false;
    const keyUsages: KeyUsage[] = ["encrypt", "wrapKey"];
    const keyMaterial = this.fromStringBase64Url(publicKey);

    return webcrypto.subtle.importKey(
      format,
      keyMaterial,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      extractable,
      keyUsages,
    );
  }

  /**
   * Decrypt a symmetric key that was encrypted with RSA-OAEP.
   * Input and output use base64url for interoperability.
   */
  async decryptEncKey(
    encKeyBase64url: string,
    privateKey: CryptoKey,
  ): Promise<Buffer> {
    const encKey = this.fromStringBase64Url(encKeyBase64url);
    try {
      const decryptedKey = await webcrypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
        },
        privateKey,
        encKey,
      );
      return Buffer.from(decryptedKey);
    } catch {
      throw new BadRequestError(
        "Failed to decrypt encrypted key",
        "encKey",
        "DECRYPT_ERROR",
      );
    }
  }

  /**
   * Import an AES-GCM symmetric key from raw bytes.
   */
  async importSymmetricKey(rawKey: Buffer): Promise<CryptoKey> {
    if (!Buffer.isBuffer(rawKey) || rawKey.length === 0) {
      throw new ValidationError(
        "Raw key buffer is required",
        "rawKey",
        "REQUIRED_FIELD",
      );
    }
    if (![16, 24, 32].includes(rawKey.length)) {
      throw new ValidationError(
        "AES key must be 128/192/256 bits",
        "rawKey",
        "INVALID_LENGTH",
      );
    }
    const key = await webcrypto.subtle.importKey(
      "raw",
      rawKey,
      {
        name: "AES-GCM",
      },
      true,
      ["encrypt", "decrypt"],
    );
    return key;
  }

  /**
   * Decrypt an AES-GCM payload.
   * Requires 12-byte IV and returns decoded UTF-8 string.
   */
  async decryptPayload(
    cipherTextBase64url: string,
    ivBase64url: string,
    symKey: CryptoKey,
  ): Promise<string> {
    const cipherText = this.fromStringBase64Url(cipherTextBase64url);
    const iv = this.fromStringBase64Url(ivBase64url);
    if (iv.length !== 12) {
      throw new ValidationError(
        "AES-GCM IV must be 12 bytes",
        "iv",
        "INVALID_IV_LENGTH",
      );
    }
    try {
      const decrypted = await webcrypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv,
        },
        symKey,
        cipherText,
      );
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error("Decryption error:", error);
      throw new BadRequestError(
        "Failed to decrypt payload",
        undefined,
        "DECRYPT_ERROR",
      );
    }
  }

  async exportPublicKeyDer(publicKey: CryptoKey): Promise<Buffer> {
    const exportedKey = await webcrypto.subtle.exportKey("spki", publicKey);
    return Buffer.from(exportedKey);
  }

  async exportPrivateKeyDer(privateKey: CryptoKey): Promise<Buffer> {
    const exportedKey = await webcrypto.subtle.exportKey("pkcs8", privateKey);
    return Buffer.from(exportedKey);
  }

  /**
   * Generate RSA-OAEP key pair extractable for export.
   */
  async generateKeyPair(): Promise<{
    publicKey: CryptoKey;
    privateKey: CryptoKey;
  }> {
    const keyPair = await webcrypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"],
    );
    return keyPair;
  }

  async wrapKey(symKey: CryptoKey, publicKey: CryptoKey): Promise<Buffer> {
    const wrappedKey = await webcrypto.subtle.wrapKey(
      "raw",
      symKey,
      publicKey,
      {
        name: "RSA-OAEP",
      },
    );
    return Buffer.from(wrappedKey);
  }

  /**
   * Unwrap an AES-GCM key previously wrapped with RSA-OAEP.
   */
  async unwrapKey(
    wrappedKeyBase64url: string,
    privateKey: CryptoKey,
  ): Promise<CryptoKey> {
    const wrappedKey = this.fromStringBase64Url(wrappedKeyBase64url);
    try {
      const unwrappedKey = await webcrypto.subtle.unwrapKey(
        "raw",
        wrappedKey,
        privateKey,
        {
          name: "RSA-OAEP",
        },
        {
          name: "AES-GCM",
        },
        true,
        ["encrypt", "decrypt"],
      );
      return unwrappedKey;
    } catch {
      throw new BadRequestError(
        "Failed to unwrap symmetric key",
        "wrappedKey",
        "UNWRAP_ERROR",
      );
    }
  }

  /**
   * Generate a new AES-GCM symmetric key. Default 256-bit.
   */
  async generateSymmetricKey(
    length: 128 | 192 | 256 = 256,
  ): Promise<CryptoKey> {
    const key = await webcrypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length,
      },
      true,
      ["encrypt", "decrypt"],
    );
    return key;
  }

  /**
   * Encrypt a payload using AES-GCM. Returns base64url strings.
   */
  async encryptPayload(
    plainText: string,
    symKey: CryptoKey,
    iv?: Buffer,
  ): Promise<{ cipherTextBase64url: string; ivBase64url: string }> {
    if (typeof plainText !== "string" || plainText.length === 0) {
      throw new ValidationError(
        "Plain text is required",
        "plainText",
        "REQUIRED_FIELD",
      );
    }
    const ivBytes = iv ?? webcrypto.getRandomValues(new Uint8Array(12));
    const ivBuffer = Buffer.isBuffer(ivBytes) ? ivBytes : Buffer.from(ivBytes);
    if (ivBuffer.length !== 12) {
      throw new ValidationError(
        "AES-GCM IV must be 12 bytes",
        "iv",
        "INVALID_IV_LENGTH",
      );
    }
    try {
      const encoded = new TextEncoder().encode(plainText);
      const cipherArrayBuffer = await webcrypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: ivBuffer,
        },
        symKey,
        encoded,
      );
      const cipherText = Buffer.from(cipherArrayBuffer);
      return {
        cipherTextBase64url: this.toStringBase64Url(cipherText),
        ivBase64url: this.toStringBase64Url(ivBuffer),
      };
    } catch {
      throw new BadRequestError(
        "Failed to encrypt payload",
        undefined,
        "ENCRYPT_ERROR",
      );
    }
  }

  createPrivateKey(privateKeyDer: Buffer, passphrase?: string): KeyObject {
    const options: {
      key: Buffer;
      format: "der";
      type: "pkcs8";
      passphrase?: string;
    } = {
      key: privateKeyDer,
      format: "der",
      type: "pkcs8",
    };
    if (typeof passphrase === "string") {
      options.passphrase = passphrase;
    }
    const privateKey = createPrivateKey(options);
    return privateKey;
  }
}
