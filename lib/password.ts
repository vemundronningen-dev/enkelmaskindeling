import { prisma } from '@/lib/prisma';

const DEFAULT_BCRYPT_COST = 12;

function resolveBcryptCost() {
  const rawCost = process.env.BCRYPT_COST;
  const parsedCost = Number(rawCost ?? DEFAULT_BCRYPT_COST);

  if (!Number.isInteger(parsedCost) || parsedCost < 4 || parsedCost > 31) {
    console.warn(`[password] Invalid BCRYPT_COST="${rawCost}". Falling back to ${DEFAULT_BCRYPT_COST}.`);
    return DEFAULT_BCRYPT_COST;
  }

  return parsedCost;
}

export async function hashPassword(password: string) {
  const bcryptCost = resolveBcryptCost();
  const result = await prisma.$queryRaw<Array<{ hash: string }>>`
    SELECT crypt(${password}, gen_salt('bf', CAST(${bcryptCost} AS integer))) AS hash
  `;

  const hash = result[0]?.hash ?? '';

  if (!hash) {
    throw new Error('Hashing av passord feilet: databasen returnerte tom hash.');
  }

  return hash;
}

export async function verifyPassword(password: string, storedHash: string) {
  if (!storedHash) return false;

  const result = await prisma.$queryRaw<Array<{ matches: boolean }>>`
    SELECT crypt(${password}, ${storedHash}) = ${storedHash} AS matches
  `;

  return result[0]?.matches ?? false;
}
