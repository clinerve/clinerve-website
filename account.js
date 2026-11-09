(() => {
  const supabase = window.clinerveSupabase;

  const message = document.getElementById("account-message");
  const content = document.getElementById("account-content");
  const history = document.getElementById("booking-history");
  const themeMessage = document.getElementById("theme-message");
  const saveThemeButton = document.getElementById("save-theme");

  if (!supabase) {
    message.textContent =
      "The account service did not load. Refresh and try again.";
    return;
  }

  const basePath = location.pathname.slice(
    0,
    location.pathname.lastIndexOf("/") + 1
  );

  const baseUrl = location.origin + basePath;

  let currentUser = null;

  const allowedThemes = ["signature", "midnight", "light"];

  function escapeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function applyTheme(theme) {
    const safeTheme = allowedThemes.includes(theme)
      ? theme
      : "signature";

    document.documentElement.dataset.homeTheme = safeTheme;

    const selectedInput = document.querySelector(
      `input[name="homepage-theme"][value="${safeTheme}"]`
    );

    if (selectedInput) {
      selectedInput.checked = true;
    }
  }

  async function loadTheme(user) {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("homepage_theme")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("CLINERVE theme loading error:", error);
      applyTheme("signature");
      themeMessage.textContent =
        "Your saved appearance could not be loaded. You can still choose a theme.";
      return;
    }

    applyTheme(data?.homepage_theme || "signature");
  }

  async function saveTheme() {
    if (!currentUser) return;

    const selected = document.querySelector(
      'input[name="homepage-theme"]:checked'
    );

    const theme = selected?.value || "signature";

    if (!allowedThemes.includes(theme)) {
      themeMessage.textContent = "Please select a valid theme.";
      return;
    }

    saveThemeButton.disabled = true;
    saveThemeButton.textContent = "Saving…";
    themeMessage.textContent = "";

    const { error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: currentUser.id,
          homepage_theme: theme,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: "user_id"
        }
      );

    saveThemeButton.disabled = false;
    saveThemeButton.textContent = "Save appearance";

    if (error) {
      console.error("CLINERVE theme saving error:", error);
      themeMessage.textContent =
        "Your theme could not be saved. Please try again.";
      return;
    }

    applyTheme(theme);
    themeMessage.textContent =
      "Your homepage appearance has been saved successfully.";
  }

  async function loadBookings() {
    const { data: bookings, error } = await supabase
      .from("booking_requests")
      .select(
        "reference_code, world, experience_name, visit_date, " +
        "preferred_time, visitor_count, status, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      history.textContent =
        "Your account loaded, but your bookings could not be retrieved. " +
        "Please try again later.";

      console.error("CLINERVE booking history error:", error);
      return;
    }

    if (!bookings || bookings.length === 0) {
      history.innerHTML =
        '<p class="cl-muted">You have no booking requests yet.</p>';
      return;
    }

    history.innerHTML = bookings.map((booking) => `
      <article class="cl-booking">
        <h3>${escapeText(booking.experience_name)}</h3>
        <p>
          Reference:
          <strong>${escapeText(booking.reference_code)}</strong><br>
          World: ${escapeText(booking.world)}<br>
          Visit date: ${escapeText(booking.visit_date)}<br>
          Preferred time: ${escapeText(booking.preferred_time)}<br>
          Visitors: ${escapeText(booking.visitor_count)}<br>
          Status:
          <span class="cl-status">${escapeText(booking.status)}</span>
        </p>
      </article>
    `).join("");
  }

  async function loadAccount() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      location.replace(baseUrl + "login.html?next=account.html");
      return;
    }

    currentUser = data.user;

    const name =
      currentUser.user_metadata?.full_name || "CLINERVE visitor";

    document.getElementById("account-name").textContent =
      "Welcome, " + name;

    document.getElementById("account-email").textContent =
      currentUser.email || "";

    message.textContent = "";
    content.hidden = false;

    await Promise.all([
      loadTheme(currentUser),
      loadBookings()
    ]);
  }

  saveThemeButton.addEventListener("click", saveTheme);

  document.getElementById("logout-button").addEventListener(
    "click",
    async () => {
  document.getElementById("logout-button").addEventListener(
  "click",
  async () => {
    const button = document.getElementById("logout-button");
    const originalText = button.innerHTML;

    button.disabled = true;
    button.innerHTML = "<span>Signing out…</span>";

    const { error } = await supabase.auth.signOut();

    if (error) {
      message.textContent = "Could not log out. Please try again.";
      button.disabled = false;
      button.innerHTML = originalText;
      return;
    }

    location.replace(baseUrl + "login.html");
  }
);

  loadAccount().catch((error) => {
    console.error("CLINERVE account error:", error);
    message.textContent =
      "Could not load your account. Refresh and try again.";
  });
})();
