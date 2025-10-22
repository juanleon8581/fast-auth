import { TEnvironment } from "@/domain/shared/interfaces/environments.interfaces";

interface ICryptoConfig {
  keysPath: string; // Path to the directory containing encryption keys
  cryptoEnvironment: TEnvironment[]; // Environments where encryption is enforced
  forceEncrypt: boolean; // Set to true to force encryption in all environments
  disabledEncrypt: boolean; // Set to true to disable encryption in all environments
}

const cryptoConfig: Readonly<ICryptoConfig> = {
  keysPath: "./.keys",
  cryptoEnvironment: ["prod", "qa"] as const,
  forceEncrypt: true,
  disabledEncrypt: false,
} as const;

Object.freeze(cryptoConfig);
Object.freeze(cryptoConfig.cryptoEnvironment);

export default cryptoConfig;
