/* CLINERVE Supabase client.
   Use only the Project URL and publishable/anon key here. */

(() => {
  const PROJECT_URL = "https://kdstzbmmnvfyoikkfjyb.supabase.co";
  const PUBLISHABLE_KEY = sb_publishable_qR1hfTsl_Ax63bVosNQtIA_J47R6Wns;

  if (
    PROJECT_URL.includes("https://kdstzbmmnvfyoikkfjyb.supabase.co") ||
    PUBLISHABLE_KEY.includes(sb_publishable_qR1hfTsl_Ax63bVosNQtIA_J47R6Wns)
  ) {
    console.error("CLINERVE: Add the Supabase URL and publishable key.");
    return;
  }

  if (!window.supabase?.createClient) {
    console.error("CLINERVE: Supabase JavaScript library did not load.");
    return;
  }

  window.clinerveSupabase = window.supabase.createClient(
    PROJECT_URL,
    PUBLISHABLE_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  );
})();
