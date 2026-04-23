import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export function signTodoToken() {
  // It has a short expiration, maybe 24 hours, or 7 days
  return jwt.sign({ role: 'todo_user', auth: true }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyTodoToken(token: string) {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload?.auth === true;
  } catch (error) {
    return false;
  }
}
