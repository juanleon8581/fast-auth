import { EncryptedBodyDto } from "../crypto/dtos/encrypted-body.dto";
import { TRawJson } from "../shared/interfaces/general.interfaces";
import { CryptoRepository } from "../repositories/crypto.repository";

interface IDecryptPayloadUseCase {
  execute(dto: EncryptedBodyDto, privateKey: Buffer): Promise<TRawJson>;
}

export class DecryptPayloadUseCase implements IDecryptPayloadUseCase {
  constructor(private readonly cryptoRepository: CryptoRepository) {}

  async execute(dto: EncryptedBodyDto, privateKey: Buffer): Promise<TRawJson> {
    const cipherTextBase64url = dto.encryptedPayload;
    const ivBase64url = dto.encryption.iv;
    const wrappedKeyBase64url = dto.encryption.wrappedKey;
    const privateKeyDer = privateKey;

    return this.cryptoRepository.decryptPayload(
      cipherTextBase64url,
      ivBase64url,
      wrappedKeyBase64url,
      privateKeyDer,
    );
  }
}
