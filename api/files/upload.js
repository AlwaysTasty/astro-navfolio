import { issueSignedToken } from '@vercel/blob';
import { handleUploadPresigned } from '@vercel/blob/client';
import { MAX_FILE, STORAGE_LIMIT, isAuthed, listAll } from '../_lib/files.js';

// Hands the browser a presigned upload URL so the file goes straight to Blob (functions cap request size).
// Presigned uploads work with OIDC stores (BLOB_STORE_ID + BLOB_WEBHOOK_PUBLIC_KEY), which have no read-write token.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const json = await handleUploadPresigned({
      body: req.body,
      request: req,
      getSignedToken: async (pathname) => {
        if (!isAuthed(req)) throw new Error('Not signed in');
        // exp-<unix seconds, 0 = permanent>/<16 hex chars>-<file name>; the random part keeps links unguessable.
        if (!/^exp-\d+\/[0-9a-f]{16}-[^/]+$/.test(pathname)) throw new Error('Bad pathname');
        const used = (await listAll()).reduce((sum, b) => sum + b.size, 0);
        const room = STORAGE_LIMIT - used;
        if (room <= 0) throw new Error('Storage is full. Delete something first.');
        const maximumSizeInBytes = Math.min(MAX_FILE, room);
        const token = await issueSignedToken({
          pathname,
          operations: ['put'],
          maximumSizeInBytes,
        });
        return { token, urlOptions: { maximumSizeInBytes } };
      },
    });
    return res.status(200).json(json);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
