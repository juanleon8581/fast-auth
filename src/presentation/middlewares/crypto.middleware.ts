import { DecryptPayloadUseCase } from "@/domain/use-cases/decrypt-payload.usecase";
import { CryptoService } from "@/infrastructure/services/crypto.service";
import { EncryptedBodyValidator } from "@/infrastructure/validators/encrypted-body.validator";
import { Request, Response, NextFunction } from "express";

export class CryptoMiddleware {
  static async decrypt(req: Request, _res: Response, next: NextFunction) {
    try {
      const cryptoService = CryptoService.getInstance();
      const decryptPayloadUseCase = new DecryptPayloadUseCase(cryptoService);

      const encryptedBodyDto = EncryptedBodyValidator.validate(req.body);
      const privateKey = await cryptoService.getLatestPrivateKeyBase64url();

      const decryptedPayload = await decryptPayloadUseCase.execute(
        encryptedBodyDto,
        privateKey,
      );
      console.log(
        "🚀 ~ CryptoMiddleware ~ decrypt ~ decryptedPayload:",
        decryptedPayload,
      );

      return next();
    } catch (error) {
      return next(error);
    }
  }
}
