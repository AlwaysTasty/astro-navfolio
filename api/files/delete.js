import { del } from '@vercel/blob';
import { isAuthed } from '../_lib/files.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!isAuthed(req)) return res.status(401).json({ error: 'Not signed in' });
  const { url } = req.body ?? {};
  if (typeof url !== 'string' || !url.includes('.blob.vercel-storage.com/')) {
    return res.status(400).json({ error: 'Bad url' });
  }
  try {
    await del(url);
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'Delete failed' });
  }
}
