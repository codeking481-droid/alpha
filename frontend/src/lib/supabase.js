import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create client only when env configured; otherwise export null-safe stub for dev fallback via API
let supabase;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Stub that mimics minimal auth API to avoid crashes when Supabase not configured
  const noop = async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured — set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY' } });
  supabase = {
    auth: {
      signInWithPassword: noop,
      signUp: noop,
      getSession: async () => ({ data: { session: null } }),
      getUser: noop,
      signOut: async () => ({}),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({ select: () => ({ eq: () => ({ single: noop }) }), insert: () => ({ select: () => ({ single: noop }) }) }),
  };
}

export { supabase };
export default supabase;
