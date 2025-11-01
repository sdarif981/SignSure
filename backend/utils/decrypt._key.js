import crypto from 'crypto';


export const decryptKey = (encryptedData, passphrase) => {
  const [ivBase64, encryptedBase64] = encryptedData.split(':');

  if (!ivBase64 || !encryptedBase64) {
    throw new Error('Invalid encrypted format. Expected format "iv:encrypted"');
  }

  const iv = Buffer.from(ivBase64, 'base64');
  const encrypted = Buffer.from(encryptedBase64, 'base64');

  const derivedKey = crypto.createHash('sha256').update(passphrase).digest();

  const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted; // This is your original decrypted data (e.g. PEM private key)
};
