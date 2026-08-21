import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
  "https://qsrmzajadmmgqhfbxdwu.supabase.co";

const supabaseKey =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_SUPABASE_KEY ||
      import.meta.env?.VITE_SUPABASE_ANON_KEY ||
      import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) ||
  (typeof process !== "undefined" &&
    (process.env?.VITE_SUPABASE_KEY ||
      process.env?.VITE_SUPABASE_ANON_KEY ||
      process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) ||
  "sb_publishable_ru09YlOy1LNorCk6y-SD2w_daWCqr6U";

export const supabase = createClient(supabaseUrl, supabaseKey);
