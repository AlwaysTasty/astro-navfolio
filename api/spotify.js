// Vercel serverless function: current or last-played Spotify track for the navbar pill.
// Needs SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and SPOTIFY_REFRESH_TOKEN (see scripts/spotify-auth.mjs).
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

async function getAccessToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  return (await res.json()).access_token;
}

// Only the fields the pill needs ever leave the server.
function shape(track, isPlaying, playedAt) {
  return {
    isPlaying,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    art: (track.album.images.at(-2) ?? track.album.images[0])?.url ?? null,
    url: track.external_urls.spotify,
    playedAt: playedAt ?? null,
  };
}

export default async function handler(req, res) {
  try {
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    const now = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers });
    if (now.status === 200) {
      const body = await now.json();
      if (body.is_playing && body.currently_playing_type === 'track' && body.item) {
        res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
        return res.status(200).json(shape(body.item, true));
      }
    }

    const recent = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
      headers,
    });
    if (!recent.ok) throw new Error(`recent ${recent.status}`);
    const item = (await recent.json()).items?.[0];
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    return res.status(200).json(item ? shape(item.track, false, item.played_at) : {});
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({});
  }
}
