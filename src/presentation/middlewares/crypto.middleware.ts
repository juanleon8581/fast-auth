import cryptoConfig from "@/config/crypto.config";
import envs from "@/config/envs";
import { DecryptPayloadUseCase } from "@/domain/crypto/use-cases/decrypt-payload.usecase";
import { CryptoService } from "@/infrastructure/services/crypto.service";
import { EncryptedBodyValidator } from "@/infrastructure/validators/encrypted-body.validator";
import { Request, Response, NextFunction } from "express";

export class CryptoMiddleware {
  static async decrypt(req: Request, _res: Response, next: NextFunction) {
    try {
      const validateEnvironmentEncrypt: boolean =
        cryptoConfig.cryptoEnvironment.includes(envs.NODE_ENV);

      const validateEncryptStatus: boolean =
        (validateEnvironmentEncrypt && !cryptoConfig.disabledEncrypt) ||
        cryptoConfig.forceEncrypt;

      if (!validateEncryptStatus) {
        return next();
      }

      const cryptoService = CryptoService.getInstance();
      const decryptPayloadUseCase = new DecryptPayloadUseCase(cryptoService);

      const encryptedBodyDto = EncryptedBodyValidator.validate(req.body);
      const privateKey = await cryptoService.getLatestPrivateKeyBase64url();

      const decryptedPayload = await decryptPayloadUseCase.execute(
        encryptedBodyDto,
        privateKey,
      );

      req.body = decryptedPayload;

      return next();
    } catch (error) {
      return next(error);
    }
  }
}
