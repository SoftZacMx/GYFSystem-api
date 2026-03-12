import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALG = 'aes-256-gcm';
const IV_LEN = 16;
const TAG_LEN = 16;
const KEY_LEN = 32;
const SALT_LEN = 32;

/**
 * Encrypts a string with AES-256-GCM. Key is derived from secret (e.g. ENCRYPTION_KEY) via scrypt.
 * Output format: salt (32) + iv (16) + authTag (16) + ciphertext.
 */
export function encrypt(plainText: string, secret: string): string {
  const salt = randomBytes(SALT_LEN);
  const key = scryptSync(secret, salt, KEY_LEN);
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALG, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypts a string produced by encrypt(). Returns empty string if input is empty or decryption fails.
 */
export function decrypt(encoded: string, secret: string): string {
  if (!encoded || !secret) return '';
  try {
    const buf = Buffer.from(encoded, 'base64');
    if (buf.length < SALT_LEN + IV_LEN + TAG_LEN) return '';
    const salt = buf.subarray(0, SALT_LEN);
    const iv = buf.subarray(SALT_LEN, SALT_LEN + IV_LEN);
    const tag = buf.subarray(SALT_LEN + IV_LEN, SALT_LEN + IV_LEN + TAG_LEN);
    const ciphertext = buf.subarray(SALT_LEN + IV_LEN + TAG_LEN);
    const key = scryptSync(secret, salt, KEY_LEN);
    const decipher = createDecipheriv(ALG, key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(ciphertext) + decipher.final('utf8');
  } catch {
    return '';
  }
}
