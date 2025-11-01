export async function encrypt_key(privateKeyBuffer, passphrase) {
  if (!(privateKeyBuffer instanceof ArrayBuffer)) {
    throw new Error("encrypt_key: privateKey must be an ArrayBuffer");
  }
  if (!passphrase || passphrase.length < 8) {
    throw new Error("Passphrase must be at least 8 characters long.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

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
    ["encrypt"]
  );

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    privateKeyBuffer
  );

  const combined = new Uint8Array([...salt, ...iv, ...new Uint8Array(encrypted)]);
  return btoa(String.fromCharCode(...combined));
}