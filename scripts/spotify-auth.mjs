// One-off helper that prints a Spotify refresh token for api/spotify.js.
// Usage (PowerShell):
//   $env:SPOTIFY_CLIENT_ID="..."; $env:SPOTIFY_CLIENT_SECRET="..."; node scripts/spotify-auth.mjs
// The redirect URI http://127.0.0.1:8888/callback must be added to the app in the Spotify dashboard.
import { createServer } from 'node:http';

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.');
  process.exit(1);
}

const redirect = 'http://127.0.0.1:8888/callback';
const state = Math.random().toString(36).slice(2);
const authUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    client_id: id,
    response_type: 'code',
    redirect_uri: redirect,
    scope: 'user-read-currently-playing user-read-recently-played',
    state,
  });

createServer(async (req, res) => {
  const url = new URL(req.url, redirect);
  if (url.pathname !== '/callback') return res.writeHead(404).end();
  if (url.searchParams.get('state') !== state || !url.searchParams.get('code')) {
    res.end('Authorisation failed. Close this tab and run the script again.');
    return process.exit(1);
  }
  const token = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: url.searchParams.get('code'),
      redirect_uri: redirect,
    }),
  }).then((r) => r.json());
  res.end('Done. You can close this tab and return to the terminal.');
  console.log(token.refresh_token ? `\nSPOTIFY_REFRESH_TOKEN=${token.refresh_token}\n` : token);
  process.exit(0);
}).listen(8888, () => console.log(`Open this URL in your browser:\n\n${authUrl}\n`));
