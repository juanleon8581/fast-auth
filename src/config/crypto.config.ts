import { TEnvironment } from "@/domain/interfaces/environtments.interfaces";

interface ICryptoConfig {
  keysPath: string; // Path to the directory containing encryption keys
  cryptoEnvironment: TEnvironment[]; // Environments where encryption is enforced
  forceEncrypt: boolean; // Set to true to force encryption in all environments
  disabledEncrypt: boolean; // Set to true to disable encryption in all environments
}

const cryptoConfig: ICryptoConfig = {
  keysPath: "./.keys",
  cryptoEnvironment: ["prod", "qa"],
  forceEncrypt: true,
  disabledEncrypt: false,
};

export default cryptoConfig;
