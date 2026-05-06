import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || '';
  if (key.length < KEY_LENGTH) {
    return Buffer.from(key.padEnd(KEY_LENGTH, '0').substring(0, KEY_LENGTH));
  }
  return Buffer.from(key.substring(0, KEY_LENGTH));
}

/**
 * Encrypts a Buffer (e.g. image data) and returns a hex string.
 * Format: <iv_hex>:<encrypted_hex>
 */
export function encryptBuffer(data: Buffer): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a hex string back into a Buffer.
 */
export function decryptToBuffer(encryptedStr: string): Buffer {
  const [ivHex, encryptedHex] = encryptedStr.split(':');
  if (!ivHex || !encryptedHex) throw new Error('Invalid encrypted format');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedData = Buffer.from(encryptedHex, 'hex');
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
}

/**
 * Encrypts a base64 image string (from file upload) → encrypted hex string for DB storage.
 */
export function encryptBase64Image(base64Data: string): string {
  const buffer = Buffer.from(base64Data, 'base64');
  return encryptBuffer(buffer);
}

/**
 * Decrypts DB-stored hex string → base64 string (for serving to client).
 */
export function decryptToBase64(encryptedStr: string): string {
  const buf = decryptToBuffer(encryptedStr);
  return buf.toString('base64');
}
