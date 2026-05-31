document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const hasFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  // ==========================================
  // LOADING SCREEN
  // ==========================================
  const loader = $("#loader");
  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("hidden");
    }, 1000);
  });
  setTimeout(() => {
    if (loader && !loader.classList.contains("hidden"))
      loader.classList.add("hidden");
  }, 3500);

  // ==========================================
  // RAF SCROLL SCHEDULER - coalesces all scroll handlers
  // Must be defined BEFORE initCursor()
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

  // ==========================================
  // CUSTOM CURSOR - translate3d + rAF interpolation
  // Only active on pointer devices (not touch)
  // ==========================================
  function initCursor() {
    const dot = $('#cursorDot');
    const outline = $('#cursorOutline');
    if (!dot || !outline || !hasFinePointer || prefersReducedMotion) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    document.addEventListener('mousemove', (e) => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      target.x = e.clientX;
      target.y = e.clientY;
    }, { passive: true });

    (function renderOutline() {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      outline.style.transform = `translate(${current.x}px, ${current.y}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderOutline);
    })();

    const interactive =
      "a, button, .btn, .project-card, .skill-card, .tool-card, .contact-link, .nav-link";
    document.body.addEventListener("mouseover", (e) => {
      if (e.target.closest(interactive)) {
        dot.classList.add("hovering");
        outline.classList.add("hovering");
      }
    });
    document.body.addEventListener("mouseout", (e) => {
      if (e.target.closest(interactive)) {
        dot.classList.remove("hovering");
        outline.classList.remove("hovering");
      }
    });
  }
  initCursor();

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
  // TYPING ANIMATION
  // ==========================================
  const typingText = $("#typingText");
  if (typingText) {
    const phrases = [
      "Learning MERN full-stack development + Python ",
      "BCA Student | C Programmer",
      "Continuous learner in Programming and AI",
      "AI Full Stack Enthusiast",
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
  // ==========================================
  const revealElements = $$(".reveal");
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
  // SKILL PROGRESS BARS
  // ==========================================
  const skillCards = $$(".skill-card");
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const progress = card.querySelector(".skill-progress");
          const target = card.dataset.progress || 0;
          if (progress) {
            setTimeout(() => {
              progress.style.width = target + "%";
            }, 200);
          }
          skillObserver.unobserve(card);
        }
      });
    },
    { threshold: 0.3 },
  );
  skillCards.forEach((card) => skillObserver.observe(card));

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
  // TILT CARD - Spring-smoothed 3D tilt
  // ==========================================
  class TiltCard {
    constructor(el) {
      this.el = el;
      this.current = { x: 0, y: 0, rotX: 0, rotY: 0 };
      this.target = { x: 0, y: 0 };
      this.maxTilt = 5.5;
      this.active = false;
      this.boundMove = this.onMove.bind(this);
      this.boundLeave = this.onLeave.bind(this);
      this.boundTick = this.tick.bind(this);
      this.glare = el.querySelector("[data-glare]");

      el.addEventListener("mousemove", this.boundMove);
      el.addEventListener("mouseleave", this.boundLeave);
    }

    onMove(e) {
      if (prefersReducedMotion) return;
      const rect = this.el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      this.target.x = ((y - centerY) / centerY) * this.maxTilt;
      this.target.y = ((centerX - x) / centerX) * this.maxTilt;

      if (!this.active) {
        this.active = true;
        this.tick();
      }

      if (this.glare) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        this.glare.style.setProperty("--glare-x", glareX + "%");
        this.glare.style.setProperty("--glare-y", glareY + "%");
        this.glare.style.opacity = "1";
      }
    }

    onLeave() {
      this.target.x = 0;
      this.target.y = 0;
      if (this.glare) this.glare.style.opacity = "0";
    }

    tick() {
      this.current.rotX += (this.target.x - this.current.rotX) * 0.12;
      this.current.rotY += (this.target.y - this.current.rotY) * 0.12;
      this.el.style.transform = `perspective(1000px) rotateX(${this.current.rotX}deg) rotateY(${this.current.rotY}deg) translateY(-6px)`;

      if (
        Math.abs(this.current.rotX) > 0.01 ||
        Math.abs(this.current.rotY) > 0.01 ||
        Math.abs(this.target.x) > 0.01 ||
        Math.abs(this.target.y) > 0.01
      ) {
        rAFScheduler.register(this.boundTick);
      } else {
        this.active = false;
        this.current.rotX = 0;
        this.current.rotY = 0;
        if (!this.el.matches(":hover")) {
          this.el.style.transform = "";
        }
      }
    }
  }

  const tiltCards = $$("[data-tilt]");
  const tiltInstances = [];

  const tiltObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const card = entry.target;
        if (entry.isIntersecting && hasFinePointer && !prefersReducedMotion) {
          tiltInstances.push(new TiltCard(card));
          tiltObserver.unobserve(card);
        }
      });
    },
    { threshold: 0.15 },
  );

  tiltCards.forEach((card) => tiltObserver.observe(card));

  // ==========================================
  // PARTICLE BACKGROUND - Reduced, pause offscreen
  // ==========================================
  const particleGrid = $("#particleGrid");
  if (particleGrid && !prefersReducedMotion) {
    const count = window.innerWidth < 768 ? 6 : 14;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.classList.add("particle");
      const size = (Math.random() * 2.5 + 1).toFixed(1);
      p.style.cssText = [
        `left: ${Math.random() * 100}%`,
        `animation-duration: ${(Math.random() * 20 + 12).toFixed(1)}s`,
        `animation-delay: ${(Math.random() * 12).toFixed(1)}s`,
        `width: ${size}px`,
        `height: ${size}px`,
        `opacity: ${(Math.random() * 0.25 + 0.08).toFixed(2)}`,
      ].join(";");
      fragment.appendChild(p);
    }
    particleGrid.appendChild(fragment);

    // Pause particles when hero is offscreen
    const hero = $("#hero");
    if (hero) {
      const heroObserver = new IntersectionObserver(
        ([entry]) => {
          particleGrid.classList.toggle("is-active", entry.isIntersecting);
        },
        { threshold: 0 },
      );
      heroObserver.observe(hero);
    }
  }

  // ==========================================
  // SMOOTH SCROLL for hash links
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // ==========================================
  if (hasFinePointer && !prefersReducedMotion) {
    const root = document.documentElement;
    const onMove = (e) => {
      root.style.setProperty(
        "--cursor-x",
        (e.clientX / window.innerWidth) * 100 + "%",
      );
      root.style.setProperty(
        "--cursor-y",
        (e.clientY / window.innerHeight) * 100 + "%",
      );
    };
    document.addEventListener("mousemove", onMove, { passive: true });
  }

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
}); // end DOMContentLoaded
