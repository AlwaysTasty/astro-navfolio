import { passphraseMatches, sessionCookie } from '../_lib/files.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!passphraseMatches(req.body?.passphrase)) {
    // Slows down guessing; the passphrase itself should be long.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return res.status(401).json({ error: 'Wrong passphrase' });
  }
  res.setHeader('Set-Cookie', sessionCookie());
  return res.status(200).json({ ok: true });
}
