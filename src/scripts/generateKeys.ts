import { CryptoService } from "@/infrastructure/services/crypto.service";

(async () => {
  const cryptoService = CryptoService.getInstance();
  await cryptoService.generateKeyPair();
})();
