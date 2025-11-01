// utils/generate_keys.js
export async function generate_keys() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-384",
    },
    true,
    ["sign", "verify"]
  );

  const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
  const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  // Base64 encode (for sending to server or saving if needed)
  const base64PublicKey = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
  const base64PrivateKey = btoa(String.fromCharCode(...new Uint8Array(privateKey)));

  return {
    publicKey: base64PublicKey,  // send this to server
    privateKey: base64PrivateKey, // optional for debugging
    rawPrivateKey: privateKey     // ✅ ArrayBuffer, must be used in encrypt_key
  };
}