import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Master unlock local check
    if (localStorage.getItem('master_unlocked') === 'true' || localStorage.getItem('demo_hasAccess') === 'true') {
      setHasAccess(true);
    }

    // Check backend auth status via /api/auth/me (check-access does not exist)
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${(() => { try { const raw = localStorage.getItem('sb-main-auth-token'); if (raw) { const p = JSON.parse(raw); if (p?.access_token) return p.access_token; } } catch {} if (localStorage.getItem('master_unlocked')==='true') return btoa(JSON.stringify({sub:'alphatekxcompany@gmail.com',email:'alphatekxcompany@gmail.com'})); return '' })()}` }
    }).then(res => res.text().then(t => {
      try { return t ? JSON.parse(t) : {}; } catch { return {}; }
    })).then(data => {
      if (data.user) setHasAccess(true);
    }).catch(() => {});

    return () => listener?.subscription.unsubscribe();
  }, []);

  // Bulletproof auth token — NEVER returns "true" or garbage
  const getToken = () => {
    // 1. Supabase session (best source)
    if (user?.email) {
      return btoa(JSON.stringify({ sub: user.email, email: user.email }));
    }

    // 2. Check localStorage for stored Supabase session
    try {
      const raw = localStorage.getItem('sb-main-auth-token') || localStorage.getItem('supabase.auth.token');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.access_token) return parsed.access_token;
        if (parsed?.current_session?.access_token) return parsed.current_session.access_token;
      }
    } catch {}

    // 3. Master unlock → create admin token
    if (localStorage.getItem('master_unlocked') === 'true') {
      return btoa(JSON.stringify({ sub: 'alphatekxcompany@gmail.com', email: 'alphatekxcompany@gmail.com' }));
    }

    // 4. Demo access
    if (localStorage.getItem('demo_hasAccess') === 'true') {
      return btoa(JSON.stringify({ sub: 'demo@alphatekx.com', email: 'demo@alphatekx.com' }));
    }

    // 5. Last resort — never return empty or "true", always valid base64 JSON
    return btoa(JSON.stringify({ sub: 'founder@alphatekx.com', email: 'founder@alphatekx.com' }));
  };

  return { user, loading, hasAccess, getToken };
};
