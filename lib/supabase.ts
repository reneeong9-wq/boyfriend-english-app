import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "缺少 NEXT_PUBLIC_SUPABASE_URL，請檢查 .env.local。",
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "缺少 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY，請檢查 .env.local。",
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
);