import { CryptoAdapter } from "@/infrastructure/adapters/crypto.adapter";

import { CryptoService } from "@/infrastructure/services/crypto.service";

(async () => {
  const cryptoAdapter = new CryptoAdapter();
  const cryptoService = new CryptoService(cryptoAdapter);

  await cryptoService.generateKeyPair();
})();
