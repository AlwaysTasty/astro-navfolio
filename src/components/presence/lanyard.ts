import { presence } from '../../data/presence';

export interface LanyardActivity {
  id?: string;
  type: number;
  name: string;
  details?: string;
  state?: string;
}

export interface LanyardData {
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify: { song: string; artist: string; album_art_url: string; track_id: string } | null;
}

type Listener = (data: LanyardData | null) => void;

const POLL_MS = 20_000;
const listeners = new Set<Listener>();
// undefined: not fetched yet. null: unavailable (empty ID, not in Lanyard, or network error).
let data: LanyardData | null | undefined;
let started = false;
let timer = 0;

async function poll() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${presence.discordId}`);
    const json = await res.json();
    data = json.success ? (json.data as LanyardData) : null;
  } catch {
    data = null;
  }
  for (const listener of listeners) listener(data);
}

function schedule() {
  window.clearInterval(timer);
  if (document.hidden) return;
  void poll();
  timer = window.setInterval(poll, POLL_MS);
}

export function getPresence() {
  return data;
}

// Polls only while the tab is visible, and shares one request loop between all widgets.
export function onPresence(listener: Listener) {
  listeners.add(listener);
  if (data !== undefined) listener(data);
  if (started) return;
  started = true;
  if (!presence.discordId) {
    data = null;
    return;
  }
  document.addEventListener('visibilitychange', schedule);
  schedule();
}
