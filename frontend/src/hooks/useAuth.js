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

    fetch(`${import.meta.env.VITE_API_URL}/api/auth/check-access`, {
      credentials: 'include'
    }).then(res => res.json()).then(data => {
      setHasAccess(!!data.hasAccess);
    }).catch(() => setHasAccess(false));

    return () => listener?.subscription.unsubscribe();
  }, []);

  return { user, loading, hasAccess };
};