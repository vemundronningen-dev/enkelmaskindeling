import { prisma } from '@/lib/prisma';

const BCRYPT_COST = 12;

export async function hashPassword(password: string) {
  const result = await prisma.$queryRaw<Array<{ hash: string }>>`
    SELECT crypt(${password}, gen_salt('bf', ${BCRYPT_COST})) AS hash
  `;

  return result[0]?.hash ?? '';
}

export async function verifyPassword(password: string, storedHash: string) {
  if (!storedHash) return false;

  const result = await prisma.$queryRaw<Array<{ matches: boolean }>>`
    SELECT crypt(${password}, ${storedHash}) = ${storedHash} AS matches
  `;

  return result[0]?.matches ?? false;
}
