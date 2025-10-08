import { writeFileSync, existsSync, mkdirSync } from "fs";
import { CryptoAdapter } from "@/infrastructure/adapters/crypto.adapter";
import envs from "@/config/envs";

(async () => {
  const keysPath = "./src/config/keys";
  const cryptoAdapter = new CryptoAdapter();
  const { publicKey, privateKey } = await cryptoAdapter.generateKeyPair();
  const kidName = `rsa-${new Date().toISOString().split("T")[0]}`;
  const version = 1;

  const publicKeyPem = await cryptoAdapter.exportPublicKeyPem(publicKey);
  const privateKeyPem = await cryptoAdapter.exportPrivateKeyPem(privateKey);

  const privateKeyObj = cryptoAdapter.createPrivateKey(privateKeyPem);

  const passphrase = envs.PASSPHRASE ?? "change_this_secret";

  const privateKeyPemProtected = privateKeyObj.export({
    format: "pem",
    type: "pkcs8",
    cipher: "aes-256-cbc", // algoritmo de cifrado simétrico
    passphrase,
  });

  if (!existsSync(keysPath)) {
    mkdirSync(keysPath);
  }

  writeFileSync(`${keysPath}/public-${kidName}-v${version}.pem`, publicKeyPem);
  writeFileSync(
    `${keysPath}/private-${kidName}-v${version}.pem`,
    privateKeyPemProtected,
  );
})();
