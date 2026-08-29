import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { apiUrl } from '../lib/api';

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

    // Master unlock local check - instant unlock without API
    if (localStorage.getItem('master_unlocked') === 'true' || localStorage.getItem('demo_hasAccess') === 'true') {
      setHasAccess(true);
    }

    fetch(apiUrl('/api/auth/check-access'), {
      credentials: 'include'
    }).then(res => res.text().then(t => {
      try { return t ? JSON.parse(t) : {}; } catch { return {}; }
    })).then(data => {
      if (data.hasAccess) setHasAccess(true);
    }).catch(() => {});

    return () => listener?.subscription.unsubscribe();
  }, []);

  return { user, loading, hasAccess };
};
