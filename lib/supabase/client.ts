import { createClient } from '@supabase/supabase-js';

// Browser-only. Uses anon key and respects RLS.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
