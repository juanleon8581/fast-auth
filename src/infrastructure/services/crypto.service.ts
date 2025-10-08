import { existsSync, mkdirSync, writeFileSync } from "fs";
import { CryptoAdapter } from "../adapters/crypto.adapter";
import envs from "@/config/envs";

export class CryptoService {
  constructor(
    private readonly cryptoAdapter: CryptoAdapter,
    private readonly keysPath = "./src/config/keys",
  ) {}

  private processPassphrase(passphrase: string, keyPem: string): string {
    const privateKeyObj = this.cryptoAdapter.createPrivateKey(keyPem);

    const keyPemProtected = privateKeyObj.export({
      format: "pem",
      type: "pkcs8",
      cipher: "aes-256-cbc",
      passphrase,
    });

    return keyPemProtected.toString("base64");
  }

  encryptPassPhrase(passphrase: string, keyPem: string): string {
    return this.processPassphrase(passphrase, keyPem);
  }

  decryptPassPhrase(passphrase: string, keyPemProtected: string): string {
    return this.processPassphrase(passphrase, keyPemProtected);
  }

  async generateKeyPair(): Promise<void> {
    const version = 1;
    const cryptoAdapter = this.cryptoAdapter;
    const keysPath = "./src/config/keys";
    const passphrase = envs.PASSPHRASE ?? "change_this_secret";
    const kidName = `rsa-${new Date().toISOString().split("T")[0]}`;
    const { publicKey, privateKey } = await cryptoAdapter.generateKeyPair();

    const publicKeyPem = await cryptoAdapter.exportPublicKeyPem(publicKey);
    const privateKeyPem = await cryptoAdapter.exportPrivateKeyPem(privateKey);

    const privateKeyPemProtected = this.encryptPassPhrase(
      passphrase,
      privateKeyPem,
    );

    if (!existsSync(keysPath)) {
      mkdirSync(keysPath);
    }

    writeFileSync(
      `${keysPath}/public-${kidName}-v${version}.pem`,
      publicKeyPem,
    );
    writeFileSync(
      `${keysPath}/private-${kidName}-v${version}.pem`,
      privateKeyPemProtected,
    );
  }
}
