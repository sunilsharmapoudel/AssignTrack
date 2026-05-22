import CryptoJS from 'crypto-js';

const KEY = process.env.EXPO_PUBLIC_ENCRYPTION_KEY ?? 'default_dev_key_32chars_padded!!';

// AES-256 encrypt a string value — used for sensitive SQLite fields
export function encrypt(plaintext: string): string {
  return CryptoJS.AES.encrypt(plaintext, KEY).toString();
}

// Decrypt an AES-encrypted string
export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Hash a string with SHA-256 (one-way, for non-reversible identifiers)
export function hash(value: string): string {
  return CryptoJS.SHA256(value).toString();
}
