import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export type SessionUser = {
  id: string;
  username: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }
  return secret;
}

export function signSessionToken(user: SessionUser): string {
  return jwt.sign(user, getJwtSecret(), { expiresIn: "7d" });
}

export function verifySessionToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (!decoded || typeof decoded !== "object") {
      return null;
    }

    const { id, username } = decoded as Partial<SessionUser>;
    if (typeof id !== "string" || typeof username !== "string") {
      return null;
    }

    return { id, username };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const rounds = Number.parseInt(process.env.BCRYPT_ROUNDS ?? "12", 10);
  const saltRounds = Number.isNaN(rounds) ? 12 : Math.max(8, Math.min(rounds, 14));
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
