import { existsSync, mkdirSync, writeFileSync } from "fs";
import { CryptoAdapter } from "../adapters/crypto.adapter";
import envs from "@/config/envs";
import { KeyExportOptions } from "crypto";
import { BadRequestError } from "@/domain/errors/bad-request-error";

export class CryptoService {
  constructor(
    private readonly cryptoAdapter: CryptoAdapter,
    private readonly keysPath = "./.keys",
  ) {}

  private processPassphrase(
    passphrase: string,
    key: Buffer,
    operation: "encrypt" | "decrypt",
  ): Buffer {
    // Passphrase validada desde envs.ts; verificar buffer de clave
    if (!Buffer.isBuffer(key) || key.length === 0) {
      throw new BadRequestError(
        "Private key DER buffer is required",
        "key",
        "REQUIRED_FIELD",
      );
    }
    try {
      // For decrypt operation, the incoming key is protected and needs passphrase.
      // For encrypt operation, the incoming key is unprotected; no passphrase required to import.
      const privateKeyObj =
        operation === "decrypt"
          ? this.cryptoAdapter.createPrivateKey(key, passphrase)
          : this.cryptoAdapter.createPrivateKey(key);

      const options: KeyExportOptions<"der"> = {
        format: "der",
        type: "pkcs8",
      };

      if (operation === "encrypt") {
        options.cipher = "aes-256-cbc";
        options.passphrase = passphrase;
      }

      const keyDerProtected = privateKeyObj.export(options);
      return keyDerProtected;
    } catch {
      const code =
        operation === "encrypt" ? "PROTECT_ERROR" : "UNPROTECT_ERROR";
      const field = operation === "encrypt" ? "key" : "keyDerProtected";
      throw new BadRequestError(
        "Failed to process passphrase operation",
        field,
        code,
      );
    }
  }

  encryptPassPhrase(passphrase: string, key: Buffer): Buffer {
    return this.processPassphrase(passphrase, key, "encrypt");
  }

  async decryptPassPhrase(
    passphrase: string,
    keyDerProtected: Buffer,
  ): Promise<CryptoKey> {
    const keyDer = this.processPassphrase(
      passphrase,
      keyDerProtected,
      "decrypt",
    );

    const cryptoKey = await this.cryptoAdapter.importPrivateKey(
      keyDer.toString("base64url"),
    );

    return cryptoKey;
  }

  async generateKeyPair(): Promise<void> {
    const version = 1;
    const keysPath = this.keysPath;
    const cryptoAdapter = this.cryptoAdapter;
    const passphrase = envs.PASSPHRASE;
    const kidName = `rsa-${new Date().toISOString().split("T")[0]}`;
    const { publicKey, privateKey } = await cryptoAdapter.generateKeyPair();

    const publicKeyDer = await cryptoAdapter.exportPublicKeyDer(publicKey);
    const privateKeyDer = await cryptoAdapter.exportPrivateKeyDer(privateKey);

    const privateKeyDerProtected = this.encryptPassPhrase(
      passphrase,
      privateKeyDer,
    );
    try {
      if (!existsSync(keysPath)) {
        mkdirSync(keysPath);
      }
      writeFileSync(
        `${keysPath}/public-${kidName}-v${version}.der`,
        publicKeyDer,
      );
      writeFileSync(
        `${keysPath}/private-${kidName}-v${version}.der`,
        privateKeyDerProtected,
      );
    } catch {
      throw new BadRequestError(
        "Persisting keys failed",
        "keysPath",
        "IO_ERROR",
      );
    }
  }
}
