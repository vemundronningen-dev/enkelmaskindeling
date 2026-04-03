import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

function parseHash(storedHash: string) {
  const [salt, hash] = storedHash.split(':');
  return { salt, hash };
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const { salt, hash } = parseHash(storedHash);
  if (!salt || !hash) return false;

  const passwordHash = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(hash, 'hex');

  if (passwordHash.length !== storedBuffer.length) return false;

  return timingSafeEqual(passwordHash, storedBuffer);
}
