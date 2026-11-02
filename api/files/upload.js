import { handleUpload } from '@vercel/blob/client';
import { MAX_FILE, STORAGE_LIMIT, isAuthed, listAll } from '../_lib/files.js';

// Hands the browser a short-lived token so the file goes straight to Blob (functions cap request size).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const json = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!isAuthed(req)) throw new Error('Not signed in');
        if (!/^exp-\d+\/[^/]+$/.test(pathname)) throw new Error('Bad pathname');
        const used = (await listAll()).reduce((sum, b) => sum + b.size, 0);
        const room = STORAGE_LIMIT - used;
        if (room <= 0) throw new Error('Storage is full. Delete something first.');
        return { addRandomSuffix: true, maximumSizeInBytes: Math.min(MAX_FILE, room) };
      },
    });
    return res.status(200).json(json);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
