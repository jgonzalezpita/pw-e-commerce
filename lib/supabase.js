import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// En el browser usa createBrowserClient (guarda sesión en cookies, compatible con Server Components)
// En el servidor usa createClient (para SSR/build sin crashear)
export const supabase = typeof window !== 'undefined'
  ? createBrowserClient(url, key)
  : createClient(url, key);
