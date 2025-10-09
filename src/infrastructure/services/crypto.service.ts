import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "fs";
import { CryptoAdapter } from "../adapters/crypto.adapter";
import envs from "@/config/envs";
import { KeyExportOptions } from "crypto";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { CryptoRepository } from "@/domain/repositories/crypto.repository";
import { TRawJson } from "@/domain/interfaces/general.interfaces";

export class CryptoService implements CryptoRepository {
  private readonly cryptoAdapter: CryptoAdapter = new CryptoAdapter();
  private readonly _keysPath = "./.keys";
  private static _instance: CryptoService;

  private constructor() {
    Object.freeze(this);
  }

  static getInstance(): CryptoService {
    if (!CryptoService._instance) {
      CryptoService._instance = new CryptoService();
    }
    return CryptoService._instance;
  }

  get keysPath(): string {
    return this._keysPath;
  }

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
  ): Promise<Buffer> {
    const keyDer = this.processPassphrase(
      passphrase,
      keyDerProtected,
      "decrypt",
    );

    // const cryptoKey = await this.cryptoAdapter.importPrivateKey(keyDer);

    return keyDer;
  }

  async generateKeyPair(): Promise<void> {
    const version = 1;
    const keysPath = this.keysPath;
    const cryptoAdapter = this.cryptoAdapter;
    const passphrase = envs.PASSPHRASE;
    const kidName = `rsa-${new Date().toISOString().split("T")[0]}`;
    const publicPath = `${keysPath}/public-${kidName}-v${version}.der`;
    const privatePath = `${keysPath}/private-${kidName}-v${version}.der`;
    // Guard: evitar sobrescritura si ya existen las llaves del día
    if (existsSync(publicPath) || existsSync(privatePath)) {
      console.info(
        `🔒 Key generation skipped: keys for '${kidName}-v${version}' already exist.`,
      );
      return;
    }
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
      writeFileSync(publicPath, publicKeyDer);
      writeFileSync(privatePath, privateKeyDerProtected);
      console.info(`✅ Keys generated for '${kidName}-v${version}'.`);
    } catch {
      throw new BadRequestError(
        "Persisting keys failed",
        "keysPath",
        "IO_ERROR",
      );
    }
  }

  /**
   * Devuelve la clave pública más reciente en formato base64url DER.
   * Busca archivos con patrón `public-*.der` dentro de `./.keys` y selecciona el más nuevo por nombre.
   */
  getLatestPublicKeyBase64url(): string {
    const keysPath = this.keysPath;
    if (!existsSync(keysPath)) {
      throw new BadRequestError(
        "Keys directory not found",
        "keysPath",
        "NOT_FOUND",
      );
    }
    const files = readdirSync(keysPath).filter(
      (f) => f.startsWith("public-") && f.endsWith(".der"),
    );
    if (files.length === 0) {
      throw new BadRequestError(
        "No public key found",
        "publicKey",
        "NOT_FOUND",
      );
    }
    // Ordenar por nombre descendente (iso-date incluido en nombre), tomar el primero
    const latest = files.sort().reverse()[0];
    const der = readFileSync(`${keysPath}/${latest}`);
    return der.toString("base64url");
  }

  async getLatestPrivateKeyBase64url(): Promise<Buffer> {
    const keysPath = this.keysPath;
    if (!existsSync(keysPath)) {
      throw new BadRequestError(
        "Keys directory not found",
        "keysPath",
        "NOT_FOUND",
      );
    }
    const files = readdirSync(keysPath).filter(
      (f) => f.startsWith("private-") && f.endsWith(".der"),
    );
    if (files.length === 0) {
      throw new BadRequestError(
        "No private key found",
        "privateKey",
        "NOT_FOUND",
      );
    }

    const latest = files.sort().reverse()[0];
    const der = readFileSync(`${keysPath}/${latest}`);

    const decryptedPrivateKey = await this.decryptPassPhrase(
      envs.PASSPHRASE,
      der,
    );

    return decryptedPrivateKey;
  }

  async decryptPayload(
    cipherTextBase64url: string,
    ivBase64url: string,
    wrappedKeyBase64url: string,
    privateKeyDer: Buffer,
  ): Promise<TRawJson> {
    // Importar clave privada PKCS8 DER para usar en RSA-OAEP
    const privateKey = await this.cryptoAdapter.importPrivateKey(
      privateKeyDer,
    );

    // Desempaquetar la clave simétrica AES-GCM previamente envuelta con RSA-OAEP
    const symKey = await this.cryptoAdapter.unwrapKey(
      wrappedKeyBase64url,
      privateKey,
    );

    // Desencriptar el payload con AES-GCM usando la clave simétrica y el IV
    const decrypted = await this.cryptoAdapter.decryptPayload(
      cipherTextBase64url,
      ivBase64url,
      symKey,
    );
    return JSON.parse(decrypted);
  }
}
