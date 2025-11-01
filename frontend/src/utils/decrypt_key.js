export async function decrypt_key(encryptedBase64, passphrase) {
  if (!encryptedBase64 || typeof encryptedBase64 !== 'string') {
    throw new Error("Invalid encrypted key format.");
  }
  let combinedBytes;
  try {
    combinedBytes = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
  } catch (e) {
    throw new Error("Invalid base64 encoding in encrypted key.");
  }
  if (combinedBytes.length < 28) {
    throw new Error("Encrypted key data is too short.");
  }

  const salt = combinedBytes.slice(0, 16);
  const iv = combinedBytes.slice(16, 28);
  const ciphertext = combinedBytes.slice(28);

  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  try {
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      aesKey,
      ciphertext
    );
    return decrypted;
  } catch (e) {
    console.error("Decryption failed:", e);
    throw new Error("Incorrect passphrase or corrupted data.");
  }
}