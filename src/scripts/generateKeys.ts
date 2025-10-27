import { CryptoService } from "@/infrastructure/services/crypto/crypto.service";

(async () => {
  const cryptoService = CryptoService.getInstance();
  await cryptoService.generateKeyPair();
})();
