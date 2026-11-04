import { MAX_FILE, STORAGE_LIMIT, expiryOf, isAuthed, listAll } from '../_lib/files.js';

export default async function handler(req, res) {
  if (!isAuthed(req)) return res.status(401).json({ error: 'Not signed in' });
  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: 'Blob store not connected: BLOB_STORE_ID is missing.' });
  }
  try {
    const blobs = await listAll();
    const files = blobs
      .map((b) => ({
        url: b.url,
        downloadUrl: b.downloadUrl,
        name: b.pathname.replace(/^exp-\d+\/[0-9a-f]{16}-/, ''),
        size: b.size,
        uploadedAt: b.uploadedAt,
        expires: expiryOf(b.pathname) ?? 0,
      }))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      files,
      used: blobs.reduce((sum, b) => sum + b.size, 0),
      limit: STORAGE_LIMIT,
      maxFile: MAX_FILE,
    });
  } catch {
    return res.status(502).json({ error: 'Could not list files' });
  }
}
