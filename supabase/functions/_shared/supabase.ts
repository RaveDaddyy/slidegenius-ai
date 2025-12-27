import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? "";

export function getUserClient(req: Request) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: req.headers.get("Authorization") ?? "",
      },
    },
  });
}

export function getAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

export async function requireUser(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase env vars");
  }
  const supabase = getUserClient(req);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return { user: null, error: error ?? new Error("Unauthorized") };
  }
  return { user: data.user, error: null };
}
