// Shared helpers for the /files temp-hosting functions. The leading "_" keeps this from being a route.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { list } from '@vercel/blob';

export const MAX_FILE = 100 * 1024 * 1024;
// Stay under the 1 GB Hobby storage quota with some headroom.
export const STORAGE_LIMIT = 900 * 1024 * 1024;
const SESSION_SECONDS = 60 * 60 * 24 * 30;

const sign = (exp) =>
  createHmac('sha256', process.env.FILES_PASSPHRASE ?? '')
    .update(String(exp))
    .digest('hex');

const same = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function passphraseMatches(input) {
  const real = process.env.FILES_PASSPHRASE;
  return Boolean(real) && typeof input === 'string' && same(input, real);
}

export function sessionCookie() {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  return `files_session=${exp}.${sign(exp)}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

// Fails closed when FILES_PASSPHRASE is unset.
export function isAuthed(req) {
  if (!process.env.FILES_PASSPHRASE) return false;
  const match = /(?:^|;\s*)files_session=(\d+)\.([0-9a-f]+)/.exec(req.headers.cookie ?? '');
  if (!match) return false;
  const [, exp, sig] = match;
  return Number(exp) > Date.now() / 1000 && same(sig, sign(exp));
}

// Expiry lives in the pathname ("exp-<unix seconds>/name", 0 = permanent), so no database is needed.
export function expiryOf(pathname) {
  const match = /^exp-(\d+)\//.exec(pathname);
  return match ? Number(match[1]) : null;
}

export async function listAll() {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}
