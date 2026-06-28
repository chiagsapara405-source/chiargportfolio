document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const hasFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));


  //right to left reveal for hero visual
  gsap.fromTo("#heroVisual", {
    opacity: 0,
    x: 100,      // positive = starts from right
  }, {
    opacity: 1,
    x: 0,
    duration: 1,
    delay: 3,
    ease: "power4.out",
  });
  
  // ==========================================
  // LOADER — GSAP split-name reveal
  // ==========================================
  if (typeof gsap !== "undefined") {
    const tl = gsap.timeline();

    tl.from(".loader-name span", {
      y: 150,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: "power4.out",
    })

      .to(".loader-progress", {
        width: "100%",
        duration: 1.2,
        ease: "power2.inOut",
      }, "-=0.6")

      .from(".loader-text", {
        opacity: 0,
        y: 20,
        duration: 0.6,
      }, "-=0.8")

      .to(".loader", {
        yPercent: -100,
        duration: 1,
        ease: "power4.inOut",
        delay: 0.3,
      })

      .fromTo(".hero-content", {
        opacity: 0,
        y: 100,
      }, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power4.out",
        onComplete: () => {
          // Clear GSAP inline props so CSS (hover, etc.) works normally
          gsap.set(".hero-content", { clearProps: "transform,opacity" });
        },
      }, "-=0.5");
  }

  // ==========================================
  // RAF SCROLL SCHEDULER - coalesces all scroll handlers
  // ==========================================
  const rAFScheduler = {
    callbacks: new Set(),
    ticking: false,
    register(fn) {
      this.callbacks.add(fn);
      this.schedule();
    },
    unregister(fn) {
      this.callbacks.delete(fn);
    },
    schedule() {
      if (!this.ticking) {
        this.ticking = true;
        requestAnimationFrame(() => {
          this.ticking = false;
          this.callbacks.forEach((fn) => fn());
        });
      }
    },
  };

  let scrollHandlersRegistered = false;
  function registerScrollHandlers() {
    if (scrollHandlersRegistered) return;
    scrollHandlersRegistered = true;

    const scrollProgress = $("#scrollProgress");
    const navbar = $("#navbar");
    const backToTop = $("#backToTop");
    const sections = $$(".section");
    const sectionOffsets = sections.map((section) => ({
      id: section.getAttribute("id"),
      offsetTop: section.offsetTop,
    }));
    const navLinks = $$(".nav-link");

    if (backToTop) {
      backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    let cachedScrollY = 0;
    let cachedScrollHeight = 0;
    let cachedWinHeight = 0;

    function onScroll() {
      cachedScrollY = window.pageYOffset;
      cachedScrollHeight = document.documentElement.scrollHeight;
      cachedWinHeight = window.innerHeight;
      rAFScheduler.register(updateAll);
    }

    function updateAll() {
      const scrollY = cachedScrollY;
      const maxScroll = cachedScrollHeight - cachedWinHeight;

      // Scroll progress
      if (scrollProgress && maxScroll > 0) {
        scrollProgress.style.transform = `scaleX(${scrollY / maxScroll})`;
      }

      // Navbar background
      if (navbar) {
        navbar.classList.toggle("scrolled", scrollY > 80);
      }

      // Back to top
      if (backToTop) {
        backToTop.classList.toggle("visible", scrollY > 500);
      }

      // Active nav link
      let current = "";
      sectionOffsets.forEach((section) => {
        if (scrollY >= section.offsetTop - 160) {
          current = section.id;
        }
      });
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.dataset.section === current);
        if (link.dataset.section === current) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial update
    onScroll();
  }
  registerScrollHandlers();

  // ==========================================
  // NAVBAR - Mobile toggle
  // ==========================================
  const navToggle = $("#navToggle");
  const navLinksContainer = $("#navLinks");
  if (navToggle && navLinksContainer) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinksContainer.classList.toggle("open");
      navToggle.classList.toggle("active", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen);
    });
    navLinksContainer.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navLinksContainer.classList.remove("open");
        navToggle.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navLinksContainer.classList.contains("open")) {
        navLinksContainer.classList.remove("open");
        navToggle.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  // ==========================================
  // TYPING ANIMATION — with "why" statement
  // ==========================================
  const typingText = $("#typingText");
  if (typingText) {
    const phrases = [
      "Learning MERN full-stack development + Python ",
      "BCA Student | C Programmer",
      "Building the web to make a difference ",
      "AI Full Stack Enthusiast",
      "Code with purpose. Build with passion. ",
    ];
    let phraseIndex = 0,
      charIndex = 0,
      isDeleting = false;

    function type() {
      const phrase = phrases[phraseIndex];
      typingText.textContent = phrase.substring(
        0,
        charIndex + (isDeleting ? -1 : 1),
      );
      charIndex += isDeleting ? -1 : 1;

      if (!isDeleting && charIndex === phrase.length) {
        setTimeout(() => {
          isDeleting = true;
          type();
        }, 2000);
        return;
      }
      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(type, 500);
        return;
      }
      setTimeout(type, isDeleting ? 40 : 80);
    }
    type();
  }

  // ==========================================
  // SCROLL REVEAL ANIMATIONS
  // (exclude hero-content — GSAP loader handles it)
  // ==========================================
  const revealElements = $$(".reveal:not(.hero-content)");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
  );
  revealElements.forEach((el) => revealObserver.observe(el));

  // ==========================================
  // SKILL CARDS — (progress bars removed;
  //  neumorphic design uses percent badges instead)
  // ==========================================

  // ==========================================
  // STAT COUNTER ANIMATION
  // ==========================================
  const statNumbers = $$(".stat-number");
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          if (isNaN(target) || target <= 0) {
            el.textContent = "0+";
            return;
          }
          let current = 0;
          const steps = 40;
          const step = Math.ceil(target / steps);
          const delay = Math.floor(1500 / steps);
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              el.textContent = target + "+";
              clearInterval(timer);
            } else {
              el.textContent = current;
            }
          }, delay);
          statObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 },
  );
  statNumbers.forEach((el) => statObserver.observe(el));

  // ==========================================
  // (Tilt and particle effects removed —
  //  neumorphic design relies on pure CSS depth)
  // ==========================================

  // ==========================================
  // HASH LINKS — handled natively via CSS scroll-behavior: smooth
  // (removed custom JS to preserve URL hash updates for
  //  browser back/forward and bookmarkable sections)
  // ==========================================

  // ==========================================
  // HERO PARALLAX - Mouse move
  // ==========================================
  const hero = $("#hero");
  if (hero && hasFinePointer && !prefersReducedMotion) {
    let heroTicking = false;
    let lastHeroX = 0,
      lastHeroY = 0;

    hero.addEventListener("mousemove", (e) => {
      lastHeroX = e.clientX;
      lastHeroY = e.clientY;
      if (!heroTicking) {
        heroTicking = true;
        requestAnimationFrame(() => {
          heroTicking = false;
          const badges = hero.querySelectorAll(".floating-badge");
          const profileRing = hero.querySelector(".profile-ring");
          const speed = 0.025;
          const dx = (window.innerWidth / 2 - lastHeroX) * speed;
          const dy = (window.innerHeight / 2 - lastHeroY) * speed;

          if (profileRing) {
            profileRing.style.transform = `translate(${dx}px, ${dy}px)`;
          }
          badges.forEach((badge, i) => {
            const f = (i + 1) * 0.04;
            badge.style.transform = `translate(${-dx * f}px, ${-dy * f}px)`;
          });
        });
      }
    });

    hero.addEventListener("mouseleave", () => {
      const profileRing = hero.querySelector(".profile-ring");
      if (profileRing) profileRing.style.transform = "";
      hero
        .querySelectorAll(".floating-badge")
        .forEach((b) => (b.style.transform = ""));
    });
  }

  // ==========================================
  // CONTACT FORM - Formspree integration
  // ==========================================
  const contactForm = $("#contactForm");
  const formStatus = $("#formStatus");

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector(".form-submit");
      const originalHTML = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<span>Sending...</span><i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';
      formStatus.className = "form-status";
      formStatus.textContent = "";

      const action = contactForm.getAttribute("action") || "";
      const isConfigured = !action.includes("YOUR_FORM_ID");

      if (!isConfigured) {
        await new Promise((r) => setTimeout(r, 1200));
        showStatus(
          "success",
          "Message sent! (Configure Formspree in the action URL to go live.)",
        );
        contactForm.reset();
      } else {
        try {
          const data = new FormData(contactForm);
          const response = await fetch(action, {
            method: "POST",
            body: data,
            headers: { Accept: "application/json" },
          });
          if (response.ok) {
            showStatus("success", "Message sent! I will get back to you soon.");
            contactForm.reset();
          } else throw new Error("Server error");
        } catch {
          showStatus(
            "error",
            "Something went wrong. Try emailing me directly.",
          );
        }
      }

      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;
    });

    function showStatus(type, message) {
      formStatus.className = "form-status " + type;
      formStatus.textContent = message;
    }
  }

  // ==========================================
  // THEME TOGGLE — Dark / Light mode
  // ==========================================
  const themeToggle = $("#themeToggle");
  const themeIcon = $("#themeIcon");
  const STORAGE_KEY = "portfolio-theme";

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    if (themeIcon) {
      themeIcon.className = theme === "dark" ? "fas fa-moon" : "fas fa-sun";
    }
  }

  // Load saved preference (default to dark)
  const saved = localStorage.getItem(STORAGE_KEY) || "dark";
  setTheme(saved);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      setTheme(current === "dark" ? "light" : "dark");
    });
  }
}); // end DOMContentLoaded
