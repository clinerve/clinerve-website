(() => {
  const supabase = window.clinerveSupabase;

  if (!supabase) {
    document.getElementById("account-message").textContent =
      "The account service did not load. Refresh and try again.";
    return;
  }

  const basePath = location.pathname.slice(
    0,
    location.pathname.lastIndexOf("/") + 1
  );
  const baseUrl = location.origin + basePath;

  const message = document.getElementById("account-message");
  const content = document.getElementById("account-content");
  const history = document.getElementById("booking-history");

  function escapeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  async function loadAccount() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      location.replace(baseUrl + "login.html?next=account.html");
      return;
    }

    const user = data.user;
    const name = user.user_metadata?.full_name || "CLINERVE visitor";

    document.getElementById("account-name").textContent =
      "Welcome, " + name;
    document.getElementById("account-email").textContent = user.email || "";

    message.textContent = "";
    content.hidden = false;

    const { data: bookings, error: bookingError } = await supabase
      .from("booking_requests")
      .select(
        "reference_code, world, experience_name, visit_date, " +
        "preferred_time, visitor_count, status, created_at"
      )
      .order("created_at", { ascending: false });

    if (bookingError) {
      history.textContent =
        "Your account loaded, but your bookings could not be retrieved. " +
        "Please try again later.";
      console.error("CLINERVE booking history error:", bookingError);
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
          Reference: <strong>${escapeText(booking.reference_code)}</strong><br>
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

  document.getElementById("logout-button").addEventListener(
    "click",
    async () => {
      const button = document.getElementById("logout-button");
      button.disabled = true;

      const { error } = await supabase.auth.signOut();

      if (error) {
        message.textContent = "Could not log out. Please try again.";
        button.disabled = false;
        return;
      }

      location.replace(baseUrl + "login.html");
    }
  );

  loadAccount().catch((error) => {
    console.error(error);
    message.textContent = "Could not load your account. Refresh and try again.";
  });
})();
