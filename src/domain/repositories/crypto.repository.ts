import { TRawJson } from "../shared/interfaces/general.interfaces";

export abstract class CryptoRepository {
  abstract encryptPassPhrase(passphrase: string, key: Buffer): Buffer;
  abstract decryptPassPhrase(
    passphrase: string,
    keyDerProtected: Buffer,
  ): Promise<Buffer>;
  abstract generateKeyPair(): Promise<void>;
  abstract getLatestPublicKeyBase64url(): string;
  abstract getLatestPrivateKeyBase64url(): Promise<Buffer>;
  abstract decryptPayload(
    cipherTextBase64url: string,
    ivBase64url: string,
    wrappedKeyBase64url: string,
    privateKeyDer: Buffer,
  ): Promise<TRawJson>;
}
