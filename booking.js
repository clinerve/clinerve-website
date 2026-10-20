(() => {
  const supabase = window.clinerveSupabase;

  const message = document.getElementById("booking-message");
  const form = document.getElementById("booking-form");

  if (!supabase) {
    message.textContent =
      "The booking service did not load. Refresh and try again.";
    form.hidden = true;
    return;
  }

  const basePath = location.pathname.slice(
    0,
    location.pathname.lastIndexOf("/") + 1
  );
  const baseUrl = location.origin + basePath;

  const worldNames = {
    playverse: "Playverse",
    hypercinema: "HyperCinema",
    discovery: "Discovery",
    imagination: "Imagination / Digital Art"
  };

  const dateInput = document.getElementById("visit-date");
  const today = new Date();
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  dateInput.min = localToday;

  function showMessage(text) {
    message.textContent = text;
  }

  async function checkUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      location.replace(baseUrl + "login.html?next=booking.html");
      return null;
    }

    const user = data.user;
    document.getElementById("visitor-email").value = user.email || "";

    const name = user.user_metadata?.full_name || "";
    document.getElementById("visitor-name").value = name;

    return user;
  }

  let currentUser = null;

  checkUser().then((user) => {
    currentUser = user;
    if (user) showMessage("");
  }).catch((error) => {
    console.error(error);
    showMessage("Could not verify your session. Refresh and try again.");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = document.getElementById("booking-submit");
    button.disabled = true;

    try {
      // Always verify the current session again before submission.
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        location.replace(baseUrl + "login.html?next=booking.html");
        return;
      }

      currentUser = userData.user;

      const world = document.getElementById("booking-world").value;
      const experience = document.getElementById("experience-name")
        .value.trim();
      const visitorName = document.getElementById("visitor-name")
        .value.trim();
      const visitorEmail = document.getElementById("visitor-email")
        .value.trim().toLowerCase();
      const visitDate = dateInput.value;
      const preferredTime = document.getElementById("preferred-time").value;
      const visitorCount = Number(
        document.getElementById("visitor-count").value
      );
      const specialRequests = document.getElementById("special-requests")
        .value.trim();

      if (!Object.hasOwn(worldNames, world)) {
        throw new Error("Choose a valid CLINERVE world.");
      }

      if (!experience || experience.length > 150) {
        throw new Error("Enter a valid experience name.");
      }

      if (!visitorName || visitorName.length > 100) {
        throw new Error("Enter your full name.");
      }

      if (!visitorEmail || visitorEmail.length > 254) {
        throw new Error("Enter a valid email address.");
      }

      if (!visitDate || visitDate < localToday) {
        throw new Error("Choose today or a future date.");
      }

      if (!preferredTime) {
        throw new Error("Choose your preferred time.");
      }

      if (!Number.isInteger(visitorCount) ||
          visitorCount < 1 || visitorCount > 20) {
        throw new Error("Visitor count must be between 1 and 20.");
      }

      if (specialRequests.length > 2000) {
        throw new Error("Additional information is too long.");
      }

      showMessage("Submitting your request…");

      const payload = {
        user_id: currentUser.id,
        world,
        experience_name: experience,
        visitor_name: visitorName,
        visitor_email: visitorEmail,
        visit_date: visitDate,
        preferred_time: preferredTime,
        visitor_count: visitorCount,
        special_requests: specialRequests || null
      };

      const { data, error } = await supabase
        .from("booking_requests")
        .insert(payload)
        .select("reference_code, status")
        .single();

      if (error) throw error;

      showMessage(
        "Your booking request has been submitted. Reference: " +
        data.reference_code +
        ". Current status: " + data.status +
        ". This is a request, not a confirmed reservation."
      );

      form.reset();
      document.getElementById("visitor-email").value =
        currentUser.email || "";
      document.getElementById("visitor-name").value =
        currentUser.user_metadata?.full_name || "";
      document.getElementById("visitor-count").value = "1";
      dateInput.min = localToday;
    } catch (error) {
      console.error("CLINERVE booking submission failed:", error);
      showMessage(
        error.message ||
        "Your request could not be submitted. Please try again."
      );
    } finally {
      button.disabled = false;
    }
  });
})();
