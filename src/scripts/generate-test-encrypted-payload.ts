import { existsSync, readdirSync } from "fs";
import { CryptoService } from "../infrastructure/services/crypto.service";
import { CryptoAdapter } from "../infrastructure/adapters/crypto.adapter";
import { TRawJson } from "@/domain/interfaces/general.interfaces";

async function generateEncryptedPayload(payload: TRawJson) {
  const cryptoService = CryptoService.getInstance();
  const cryptoAdapter = new CryptoAdapter();

  // Asegurar que existe una clave pública disponible; si no, generar par de llaves
  let publicKeyDerBase64url: string;
  try {
    publicKeyDerBase64url = cryptoService.getLatestPublicKeyBase64url();
  } catch {
    await cryptoService.generateKeyPair();
    publicKeyDerBase64url = cryptoService.getLatestPublicKeyBase64url();
  }

  // Importar clave pública desde DER base64url
  const publicKey = await cryptoAdapter.importPublicKey(publicKeyDerBase64url);

  // Generar clave simétrica AES-GCM 256-bit
  const symKey = await cryptoAdapter.generateSymmetricKey(256);

  // Cifrar payload con AES-GCM
  const plainText = JSON.stringify(payload);
  const { cipherTextBase64url, ivBase64url } =
    await cryptoAdapter.encryptPayload(plainText, symKey);

  // Envolver la clave simétrica con RSA-OAEP
  const wrappedKeyBuffer = await cryptoAdapter.wrapKey(symKey, publicKey);
  const wrappedKeyBase64url = wrappedKeyBuffer.toString("base64url");

  // Obtener el kid del último archivo de clave pública
  const keysPath = cryptoService.keysPath;
  let kid = "";
  if (existsSync(keysPath)) {
    const files = readdirSync(keysPath).filter(
      (f) => f.startsWith("public-") && f.endsWith(".der"),
    );
    if (files.length > 0) {
      kid = files.sort().reverse()[0]!;
    }
  }

  // Firma simulada (placeholder). Reemplazar por firma real si se requiere.
  const signatureValue = Buffer.from(
    "mocked-signature-value==",
    "base64url",
  ).toString("base64url");

  return {
    encryption: {
      alg: "RSA-OAEP" as const,
      hash: "SHA-256" as const,
      enc: "AES-GCM" as const,
      kid,
      iv: ivBase64url,
      wrappedKey: wrappedKeyBase64url,
    },
    signature: {
      alg: "HS256" as const,
      value: signatureValue,
      timestamp: new Date().toISOString(),
    },
    encryptedPayload: cipherTextBase64url,
  };
}

// Ejemplo de uso
(async () => {
  const payload = {
    sessionToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0MzIxL2F1dGgvdjEiLCJzdWIiOiIyZGVkODFkNi04Nzc0LTQ4YTUtYmNhMC1jMjk5MjMzZTk1MTkiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU5OTc5OTY5LCJpYXQiOjE3NTk5NzYzNjksImVtYWlsIjoiYWFhYUBhYS5jb20iLCJwaG9uZSI6IjU3MzEyNDEzNDIyMCIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImRpc3BsYXlfbmFtZSI6Ikp1YW5pdGEgTGVvbmEiLCJlbWFpbCI6ImFhYWFAYWEuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiMmRlZDgxZDYtODc3NC00OGE1LWJjYTAtYzI5OTIzM2U5NTE5In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTk5NzYzNjl9XSwic2Vzc2lvbl9pZCI6IjY1MGExODZiLWM4MjgtNDg4Yi04NzYwLTRmYWViNzAxY2NkOCIsImlzX2Fub255bW91cyI6ZmFsc2V9.NSsYJvbM_ofTWCBnQEn6_6zdNXT-jtjWGtRtGfau-Cg",
    refreshToken: "fge5bgje2l4v",
    phone: "+573124134220",
    name: "Juanita",
    lastname: "Leona",
  };

  const result = await generateEncryptedPayload(payload);
  console.log(JSON.stringify(result, null, 2));
})();
