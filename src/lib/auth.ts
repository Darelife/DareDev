import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

type UserRole = 'admin' | 'user';

export type SessionUser = {
  id: string;
  username: string;
  role: UserRole;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }
  return secret;
}

export function signSessionToken(user: SessionUser): string {
  return jwt.sign(user, getJwtSecret(), { expiresIn: '7d' });
}

export function verifySessionToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (!decoded || typeof decoded !== 'object') {
      return null;
    }

    const { id, username, role } = decoded as Partial<SessionUser>;
    if (
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      (role !== 'admin' && role !== 'user')
    ) {
      return null;
    }

    return { id, username, role };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const rounds = Number.parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10);
  const saltRounds = Number.isNaN(rounds) ? 12 : Math.max(8, Math.min(rounds, 14));
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
