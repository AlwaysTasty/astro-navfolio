import { del } from '@vercel/blob';
import { expiryOf, listAll } from '../_lib/files.js';

// Daily Vercel Cron job (see vercel.json). Vercel sends "Authorization: Bearer $CRON_SECRET".
export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const now = Date.now() / 1000;
    const expired = (await listAll()).filter((b) => {
      const exp = expiryOf(b.pathname);
      return exp && exp < now;
    });
    if (expired.length) await del(expired.map((b) => b.url));
    return res.status(200).json({ deleted: expired.length });
  } catch {
    return res.status(502).json({ error: 'Cleanup failed' });
  }
}
