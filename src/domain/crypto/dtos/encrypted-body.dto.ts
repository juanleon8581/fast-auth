import {
  IEncryptedBody,
  IEncryption,
  ISignature,
} from "../interfaces/encrypted-body.interfaces";
import { TRawJson } from "../../shared/interfaces/general.interfaces";

import { ERRORS } from "@/config/strings/global.strings.json";

export class EncryptedBodyDto {
  constructor(
    public encryption: IEncryption,
    public signature: ISignature,
    public encryptedPayload: string,
  ) {
    Object.freeze(this);
  }

  static create(props: IEncryptedBody): EncryptedBodyDto {
    const { encryption, signature, encryptedPayload } = props;

    return new EncryptedBodyDto(encryption, signature, encryptedPayload);
  }

  static createFrom(data: TRawJson): [string?, EncryptedBodyDto?] {
    const { encryption, signature, encryptedPayload } = data;

    if (!encryption || !signature || !encryptedPayload)
      return [ERRORS.DATA_VALIDATION.INVALID_DATA];

    const encryptionIsValid = Object.values(encryption).every((value) => value);
    const signatureIsValid = Object.values(signature).every((value) => value);

    if (!encryptionIsValid || !signatureIsValid)
      return [ERRORS.DATA_VALIDATION.INVALID_DATA];

    return [
      undefined,
      EncryptedBodyDto.create({ encryption, signature, encryptedPayload }),
    ];
  }
}
