document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const header = document.querySelector(".header");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".navigation");
  const progress = document.querySelector(".scroll-progress");
  const year = document.querySelector("#year");
  // Homepage account navigation.
const accountNav = document.getElementById("account-nav");
const authClient = window.clinerveSupabase;

function setAccountNav(user) {
  if (!accountNav) return;

  if (user) {
    accountNav.href = "account.html";
    accountNav.textContent = "My account";
    accountNav.setAttribute(
      "aria-label",
      "Open your CLINERVE account"
    );
  } else {
    accountNav.href = "login.html";
    accountNav.textContent = "Sign in";
    accountNav.setAttribute(
      "aria-label",
      "Sign in to CLINERVE"
    );
  }
}

async function updateAccountNav() {
  if (!accountNav || !authClient) return;

  try {
    const { data, error } = await authClient.auth.getUser();

    if (error) throw error;

    setAccountNav(data.user);
  } catch (error) {
    console.error(
      "CLINERVE account navigation check failed:",
      error
    );

    setAccountNav(null);
  }
}

updateAccountNav();

if (authClient) {
  authClient.auth.onAuthStateChange((_event, session) => {
    setAccountNav(session?.user ?? null);
  });
}

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Copyright year.
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Mobile menu.
  function closeMenu() {
    if (!menuToggle || !nav) return;

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    nav.classList.remove("is-open");
    body.classList.remove("menu-open");
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const opening =
        menuToggle.getAttribute("aria-expanded") !== "true";

      menuToggle.setAttribute("aria-expanded", String(opening));
      menuToggle.setAttribute(
        "aria-label",
        opening ? "Close menu" : "Open menu"
      );

      nav.classList.toggle("is-open", opening);
      body.classList.toggle("menu-open", opening);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 640) closeMenu();
    });
  }

  // Reveal animations.
  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    // Add this class only after JavaScript is ready.
    // Without JavaScript, the CSS keeps all text visible.
    body.classList.add("js-motion");

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -25px 0px"
      }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }

  // Scroll progress and header styling.
  const sections = Array.from(
    document.querySelectorAll(
      "#home, #experiences, #about, #manifesto, #visit"
    )
  );

  const navLinks = Array.from(
    document.querySelectorAll(
      '.navigation a[href^="#"]'
    )
  );

  let ticking = false;

  function updatePage() {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    const percent = maxScroll > 0
      ? (window.scrollY / maxScroll) * 100
      : 0;

    if (progress) {
      progress.style.width = `${percent}%`;
    }

    if (header) {
      header.classList.toggle(
        "scrolled",
        window.scrollY > 35
      );
    }

    let activeSection = "home";

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= 180) {
        activeSection = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive =
        link.getAttribute("href") === `#${activeSection}`;

      link.classList.toggle("active", isActive);
    });

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updatePage);
        ticking = true;
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", updatePage);
  updatePage();
});
/* CLINERVE immersive subpage effects */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body;

    if (!page.classList.contains("world-page")) return;

      const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
            ).matches;

              const revealItems = document.querySelectorAll(".reveal");
                const progress = document.querySelector(".world-progress");

                  if (!reducedMotion && "IntersectionObserver" in window) {
                      page.classList.add("js-motion");

                          const observer = new IntersectionObserver((entries) => {
                                entries.forEach((entry) => {
                                        if (entry.isIntersecting) {
                                                  entry.target.classList.add("visible");
                                                            observer.unobserve(entry.target);
                                                                    }
                                                                          });
                                                                              }, {
                                                                                    threshold: 0.12,
                                                                                          rootMargin: "0px 0px -35px 0px"
                                                                                              });

                                                                                                  revealItems.forEach((item) => observer.observe(item));
                                                                                                    }

                                                                                                      const updateProgress = () => {
                                                                                                          if (!progress) return;

                                                                                                              const scrollable =
                                                                                                                    document.documentElement.scrollHeight - window.innerHeight;

                                                                                                                        const percentage = scrollable > 0
                                                                                                                              ? (window.scrollY / scrollable) * 100
                                                                                                                                    : 0;

                                                                                                                                        progress.style.width = `${Math.min(100, percentage)}%`;
                                                                                                                                          };

                                                                                                                                            window.addEventListener("scroll", updateProgress, { passive: true });
                                                                                                                                              window.addEventListener("resize", updateProgress);
                                                                                                                                                updateProgress();
                                                                                                                                                });
                                                                                                                                                
