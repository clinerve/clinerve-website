(() => {
  const supabase = window.clinerveSupabase;

  if (!supabase) {
    console.error("CLINERVE: Supabase client is unavailable.");
    return;
  }

  const basePath = location.pathname.slice(
    0,
    location.pathname.lastIndexOf("/") + 1
  );

  const baseUrl = location.origin + basePath;

  function showMessage(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  }

  function safeNextPage() {
    const requested = new URLSearchParams(location.search).get("next");

    if (requested === "booking.html") return "booking.html";
    if (requested === "account.html") return "account.html";

    return "account.html";
  }

  function goToNextPage() {
    location.replace(baseUrl + safeNextPage());
  }

  // Password recovery is handled on its own page.
const isResetPage =
  location.pathname.endsWith("/reset-password.html");

const recoveryParams =
  new URLSearchParams(location.hash.slice(1));

const isRecovery =
  recoveryParams.get("type") === "recovery" ||
  new URLSearchParams(location.search).get("type") === "recovery";

// Keep password recovery on its dedicated page.
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("CLINERVE session check failed:", error);
    return;
  }

  if (data.session && !isRecovery && !isResetPage) {
    goToNextPage();
  }
});

  // GOOGLE AND GITHUB SIGN-IN
  document.querySelectorAll("[data-oauth-provider]").forEach((button) => {
    button.addEventListener("click", async () => {
      const provider = button.dataset.oauthProvider;

      if (!["google", "github"].includes(provider)) {
        showMessage(
          "login-message",
          "This sign-in provider is not supported."
        );
        showMessage(
          "signup-message",
          "This sign-in provider is not supported."
        );
        return;
      }

      button.disabled = true;

      showMessage("login-message", "Connecting to " + provider + "…");
      showMessage("signup-message", "Connecting to " + provider + "…");

      try {
        const redirectUrl =
          baseUrl + "login.html?next=" +
          encodeURIComponent(safeNextPage());

        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: redirectUrl
          }
        });

        if (error) throw error;
        // Supabase normally redirects the browser to the provider.
      } catch (error) {
        console.error("CLINERVE OAuth error:", error);

        const text =
          error.message || "Could not start social sign-in. Please try again.";

        showMessage("login-message", text);
        showMessage("signup-message", text);
        button.disabled = false;
      }
    });
  });

  // EMAIL REGISTRATION
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

      if (name.length < 2 || name.length > 100) {
        showMessage("signup-message", "Enter a valid full name.");
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
            emailRedirectTo:
              baseUrl + "login.html?next=" +
              encodeURIComponent(safeNextPage())
          }
        });

        if (error) throw error;

        if (data.session) {
          goToNextPage();
        } else {
          showMessage(
            "signup-message",
            "Registration submitted. Check your email for confirmation, " +
            "then return to sign in."
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

  // EMAIL/PASSWORD LOGIN
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

        goToNextPage();
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

// SHOW OR HIDE THE PASSWORD-RESET REQUEST FORM
const forgotToggle = document.getElementById("forgot-password");
const forgotForm = document.getElementById("forgot-form");
const loginFormForReset = document.getElementById("login-form");
const socialLogin = document.querySelector(".cl-social-login");
const loginActions = document.querySelector(".cl-actions");

if (forgotToggle && forgotForm) {
  forgotToggle.addEventListener("click", () => {
    const opening = forgotForm.hidden;

    forgotForm.hidden = !opening;

    if (loginFormForReset) {
      loginFormForReset.hidden = opening;
    }

    if (socialLogin) {
      socialLogin.hidden = opening;
    }

    if (loginActions) {
      loginActions.hidden = opening;
    }

    forgotToggle.textContent = opening
      ? "Back to sign in"
      : "Forgot password?";

    showMessage("login-message", "");
  });
}

// SEND THE PASSWORD-RESET EMAIL
if (forgotForm) {
  forgotForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = document.getElementById("reset-email-submit");

    const email = document.getElementById("reset-email")
      .value.trim().toLowerCase();

    button.disabled = true;

    showMessage(
      "login-message",
      "Sending password reset link…"
    );

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: baseUrl + "reset-password.html"
        });

      if (error) throw error;

      showMessage(
        "login-message",
        "If this address is registered, a password reset email will be sent. Open the email link to choose a new password."
      );
    } catch (error) {
      showMessage(
        "login-message",
        error.message || "Could not request a password reset."
      );
    } finally {
      button.disabled = false;
    }
  });
}

// COMPLETE PASSWORD RESET ON THE DEDICATED PAGE
const resetForm = document.getElementById("reset-form");

if (resetForm && isResetPage) {
  const submitButton =
    resetForm.querySelector('button[type="submit"]');

  if (isRecovery) {
    resetForm.hidden = false;

    showMessage(
      "reset-message",
      "Choose and confirm your new password below."
    );
  } else {
    showMessage(
      "reset-message",
      "Open the password-reset link from your email to continue."
    );

    if (submitButton) {
      submitButton.disabled = true;
    }
  }

  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const password =
      document.getElementById("reset-password").value;

    const confirm =
      document.getElementById("reset-confirm").value;

    if (password.length < 8 || password !== confirm) {
      showMessage(
        "reset-message",
        "Passwords must match and contain at least 8 characters."
      );
      return;
    }

    if (!isRecovery) {
      showMessage(
        "reset-message",
        "This reset link is invalid or expired. Request a new reset email."
      );
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const {
        data: sessionData,
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionData.session) {
        throw new Error(
          "Your reset session is missing or expired. Request a new reset email."
        );
      }

      const { error } =
        await supabase.auth.updateUser({ password });

      if (error) throw error;

      showMessage(
        "reset-message",
        "Password updated successfully. You can now return to sign in."
      );

      resetForm.reset();
      resetForm.hidden = true;

      await supabase.auth.signOut();

      history.replaceState(
        null,
        "",
        location.pathname
      );
    } catch (error) {
      showMessage(
        "reset-message",
        error.message || "Could not update the password."
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
      }
})();
