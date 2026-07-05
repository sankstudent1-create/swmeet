// ---------------------------------------------------------------------------
// SUPABASE CLIENT (stub)
// ---------------------------------------------------------------------------
// This app currently runs entirely on dummy data (see lib/dummy-data.ts).
// When ready to go live:
//   1. npm install @supabase/supabase-js
//   2. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
//   3. Uncomment the code below and replace dummy-data.ts function bodies
//      with real supabase queries.
// ---------------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
