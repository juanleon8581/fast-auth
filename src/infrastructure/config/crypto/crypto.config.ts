import { TEnvironment } from "@/domain/shared/interfaces/environments.interfaces";
import envs from "../environment/envs";

interface ICryptoConfig {
  keysPath: string; // Path to the directory containing encryption keys
  cryptoEnvironment: TEnvironment[]; // Environments where encryption is enforced
  forceEncrypt: boolean; // Set to true to force encryption in all environments
  disabledEncrypt: boolean; // Set to true to disable encryption in all environments
}

const cryptoConfig: Readonly<ICryptoConfig> = {
  keysPath: "./.keys",
  cryptoEnvironment: envs.CRYPTO_ENVIRONMENT,
  forceEncrypt: envs.CRYPTO_FORCE_ENCRYPT,
  disabledEncrypt: envs.CRYPTO_DISABLED_ENCRYPT,
} as const;

Object.freeze(cryptoConfig);
Object.freeze(cryptoConfig.cryptoEnvironment);

export default cryptoConfig;
