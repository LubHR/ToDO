import 'server-only';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from '@/app/lib/db';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.SESSION_SECRET || 'a_very_secure_default_secret_key_32_chars_long!!';
const KEY = crypto.scryptSync(SECRET_KEY, 'session-salt', 32);

export function encryptSession(userId: string): string {
  const payload = JSON.stringify({ userId, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(payload, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${encrypted}:${tag}`;
}

export function decryptSession(sessionStr: string): string | null {
  try {
    const [ivHex, encryptedHex, tagHex] = sessionStr.split(':');
    if (!ivHex || !encryptedHex || !tagHex) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const payload = JSON.parse(decrypted);
    if (payload.expiresAt < Date.now()) return null;
    return payload.userId;
  } catch (e) {
    return null;
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return null;
    
    const userId = decryptSession(sessionCookie);
    if (!userId) return null;
    
    return await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    });
  } catch (error) {
    return null;
  }
}
