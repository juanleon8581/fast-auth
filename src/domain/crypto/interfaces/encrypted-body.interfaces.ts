type TSupportedAlgorithms = "RSA-OAEP" | "HS256";

export interface IEncryptedBody {
  encryption: IEncryption;
  signature: ISignature;
  encryptedPayload: string;
}

export interface IEncryption {
  alg: TSupportedAlgorithms;
  hash: "SHA-256";
  enc: "AES-GCM";
  kid: string;
  iv: string;
  wrappedKey: string;
}

export interface ISignature {
  alg: TSupportedAlgorithms;
  value: string;
  timestamp: Date;
}
