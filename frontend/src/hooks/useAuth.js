import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Demo mode: localStorage user
      const demo = localStorage.getItem('demo_user');
      if (demo) {
        try { setUser(JSON.parse(demo)); } catch { setUser({ email: 'demo@alpha.agency' }); }
        const demoAccess = localStorage.getItem('demo_hasAccess') === 'true';
        setHasAccess(demoAccess);
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          localStorage.removeItem('demo_user');
        }
      });

      // Check paid access via API - graceful fallback to demo_hasAccess or false
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl && !apiUrl.includes('your-worker') && !apiUrl.includes('placeholder')) {
        fetch(`${apiUrl}/api/auth/check-access`, { credentials: 'include' })
          .then(res => res.json())
          .then(data => setHasAccess(!!data.hasAccess))
          .catch(() => {
            const demoAccess = localStorage.getItem('demo_hasAccess') === 'true';
            setHasAccess(demoAccess);
          });
      } else {
        const demoAccess = localStorage.getItem('demo_hasAccess') === 'true';
        setHasAccess(demoAccess);
      }

      return () => listener?.subscription.unsubscribe();
    };
    init();
  }, []);

  return { user, loading, hasAccess };
};