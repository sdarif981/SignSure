import crypto from 'crypto';


export const encryptKey = (key, passphrase) => {
  const iv = crypto.randomBytes(16); // AES block size = 16 bytes

  // Derive a 256-bit (32-byte) key from passphrase
  const derivedKey = crypto.createHash('sha256').update(passphrase).digest(); // 32 bytes

  const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
  let encrypted = cipher.update(key, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Return IV and encrypted data joined (both base64)
  return `${iv.toString('base64')}:${encrypted}`;
};
