(() => {
  const supabase = window.clinerveSupabase;

  if (!supabase) {
    console.error("CLINERVE authentication client is unavailable.");
    return;
  }

  const basePath = window.location.pathname.slice(
    0,
    window.location.pathname.lastIndexOf("/") + 1
  );

  const baseUrl = window.location.origin + basePath;

  function showMessage(id, message) {
    const element = document.getElementById(id);
    if (element) element.textContent = message;
  }

  function safeNextPage() {
    const requested = new URLSearchParams(location.search).get("next");

    if (requested === "booking.html") return "booking.html";
    if (requested === "account.html") return "account.html";

    return "account.html";
  }

  // REGISTRATION
  const signupForm = document.getElementById("signup-form");

  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = document.getElementById("signup-submit");
      const name = document.getElementById("signup-name").value.trim();
      const email = document.getElementById("signup-email").value
        .trim().toLowerCase();
      const password = document.getElementById("signup-password").value;
      const confirm = document.getElementById("signup-confirm").value;

      if (name.length < 2) {
        showMessage("signup-message", "Enter your full name.");
        return;
      }

      if (password.length < 8 || password !== confirm) {
        showMessage(
          "signup-message",
          "Passwords must match and contain at least 8 characters."
        );
        return;
      }

      button.disabled = true;
      showMessage("signup-message", "Creating your account…");

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: baseUrl + "login.html?next=" +
              encodeURIComponent(safeNextPage())
          }
        });

        if (error) throw error;

        if (data.session) {
          showMessage("signup-message", "Account created. Opening your account…");
          location.replace(baseUrl + safeNextPage());
        } else {
          showMessage(
            "signup-message",
            "Registration submitted. Check your email for the confirmation link. " +
            "After confirming, return here and sign in."
          );
        }
      } catch (error) {
        showMessage(
          "signup-message",
          error.message || "Registration failed. Please try again."
        );
      } finally {
        button.disabled = false;
      }
    });
  }

  // LOGIN
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = document.getElementById("login-submit");
      const email = document.getElementById("login-email").value
        .trim().toLowerCase();
      const password = document.getElementById("login-password").value;

      button.disabled = true;
      showMessage("login-message", "Signing in…");

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        location.replace(baseUrl + safeNextPage());
      } catch (error) {
        showMessage(
          "login-message",
          error.message || "Sign-in failed. Check your details and try again."
        );
      } finally {
        button.disabled = false;
      }
    });
  }

  // REQUEST PASSWORD RESET
  const forgotButton = document.getElementById("forgot-password");

  if (forgotButton) {
    forgotButton.addEventListener("click", async () => {
      const email = document.getElementById("login-email").value
        .trim().toLowerCase();

      if (!email) {
        showMessage(
          "login-message",
          "Enter your email address first, then request a reset."
        );
        return;
      }

      forgotButton.disabled = true;

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: baseUrl + "login.html"
        });

        if (error) throw error;

        showMessage(
          "login-message",
          "If this address is registered, a password reset email will be sent. " +
          "Follow its link and return to this page."
        );
      } catch (error) {
        showMessage(
          "login-message",
          error.message || "Could not request a password reset."
        );
      } finally {
        forgotButton.disabled = false;
      }
    });
  }

  // PASSWORD RESET: Supabase returns the user to this page with
  // a recovery session in the URL/session.
  const resetForm = document.getElementById("reset-form");

  if (resetForm) {
    const hashParams = new URLSearchParams(location.hash.slice(1));

    if (hashParams.get("type") === "recovery") {
      resetForm.hidden = false;
      showMessage(
        "login-message",
        "Choose a new password below."
      );
    }

    resetForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const password = document.getElementById("reset-password").value;
      const confirm = document.getElementById("reset-confirm").value;

      if (password.length < 8 || password !== confirm) {
        showMessage(
          "login-message",
          "Passwords must match and contain at least 8 characters."
        );
        return;
      }

      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!sessionData.session) {
          throw new Error(
            "Your reset session is missing or expired. Request a new reset email."
          );
        }

        const { error } = await supabase.auth.updateUser({ password });

        if (error) throw error;

        showMessage(
          "login-message",
          "Password updated successfully. You can now use your new password."
        );

        resetForm.reset();
        resetForm.hidden = true;
        history.replaceState(null, "", location.pathname + location.search);
      } catch (error) {
        showMessage(
          "login-message",
          error.message || "Could not update the password."
        );
      }
    });
  }
})();
