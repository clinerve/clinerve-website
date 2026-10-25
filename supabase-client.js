// CLINERVE Supabase browser client
(() => {
  const SUPABASE_URL =
    "https://kdstzbmmnvfyoikkfjyb.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_qR1hfTsl_Ax63bVosNQtIA_J47R6Wns";

  if (
    !window.supabase ||
    typeof window.supabase.createClient !== "function"
  ) {
    console.error(
      "CLINERVE: Supabase library failed to load."
    );
    return;
  }

  window.clinerveSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
})();
