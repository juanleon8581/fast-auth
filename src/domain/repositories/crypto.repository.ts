import { TRawJson } from "../interfaces/general.interfaces";

export abstract class CryptoRepository {
  abstract encryptPassPhrase(passphrase: string, key: Buffer): Buffer;
  abstract decryptPassPhrase(
    passphrase: string,
    keyDerProtected: Buffer,
  ): Promise<CryptoKey>;
  abstract generateKeyPair(): Promise<void>;
  abstract getLatestPublicKeyBase64url(): string;
  abstract decryptPayload(
    cipherTextBase64url: string,
    ivBase64url: string,
    symKey: CryptoKey,
  ): Promise<TRawJson>;
}
