import { createClient } from '@supabase/supabase-js';

// Server-only client (service role — bypasses RLS). Never import in client components.
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
