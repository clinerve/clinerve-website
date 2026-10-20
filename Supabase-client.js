/* CLINERVE Supabase client.
   Use only the Project URL and publishable/anon key here. */

(() => {
  const PROJECT_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL_HERE";
  const PUBLISHABLE_KEY = "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE";

  if (
    PROJECT_URL.includes("PASTE_") ||
    PUBLISHABLE_KEY.includes("PASTE_")
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
