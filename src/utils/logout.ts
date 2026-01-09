import { supabase } from '@/integrations/supabase/client';

interface LogoutOptions {
  preserveKeys?: string[];
}

const DEFAULT_PRESERVE_KEYS = ['theme', 'language', 'user-preferences'];

async function clearAuthArtifacts(options: LogoutOptions = {}) {
  const preserve = options.preserveKeys ?? DEFAULT_PRESERVE_KEYS;

  // Snapshot preserved values
  const preserved = new Map<string, string | null>();
  try {
    preserve.forEach((k) => preserved.set(k, localStorage.getItem(k)));
  } catch {}

  // Clear storages
  try { localStorage.clear(); } catch {}
  try { sessionStorage.clear(); } catch {}

  // Restore preserved
  try {
    preserved.forEach((v, k) => { if (v !== null) localStorage.setItem(k, v); });
  } catch {}

  // Best-effort cookie cleanup
  try {
    const cookies = document.cookie?.split(';') ?? [];
    for (const c of cookies) {
      const [raw] = c.split('=');
      const name = raw?.trim();
      if (!name) continue;
      // Remove broadly; browsers will ignore HttpOnly cookies
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    }
  } catch {}

  // Clear runtime caches (service worker Cache API)
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {}
}

export async function performFullLogout(params?: { privyLogout?: () => Promise<any>; preserveKeys?: string[] }) {
  // 1) Clear any client-side caches first (no tokenService needed)
  
  // 2) Privy logout first to avoid auto-reconnect
  try { await params?.privyLogout?.(); } catch {}

  // 3) Supabase global sign out
  try { await supabase.auth.signOut({ scope: 'global' }); } catch {}

  // 4) Client-side cleanup
  await clearAuthArtifacts({ preserveKeys: params?.preserveKeys });
}
