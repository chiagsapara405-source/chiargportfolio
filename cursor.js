/* ============================================
   CUSTOM CURSOR — cursor.js
   Dot: instant via CSS transform
   Ring: lagged via GSAP quickTo (0.12s lerp)
   States wired to interactive element types
   ============================================ */

(function initCursor() {
  // Only on fine-pointer (mouse) devices
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!hasFinePointer) return;

  // Wait for GSAP (loaded by index.js)
  function waitForGSAP(cb) {
    if (window.gsap) { cb(); return; }
    const id = setInterval(() => {
      if (window.gsap) { clearInterval(id); cb(); }
    }, 30);
  }

  waitForGSAP(() => {
    // ── Create DOM elements ───────────────────
    const dot  = document.createElement("div");
    const ring = document.createElement("div");
    dot.className  = "cursor-dot";
    ring.className = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    const body = document.body;

    // ── GSAP quickTo for smooth ring lag ──────
    // Ring lags behind with a 0.12s lerp
    const moveRingX = gsap.quickTo(ring, "x", { duration: 0.12, ease: "power2.out" });
    const moveRingY = gsap.quickTo(ring, "y", { duration: 0.12, ease: "power2.out" });

    let mouseX = 0, mouseY = 0;

    // ── Mouse move — dot snaps, ring lerps ────
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Dot: instant via CSS transform (no GSAP overhead)
      dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;

      // Ring: GSAP quickTo lerp
      // quickTo uses the element's x/y gsap properties,
      // but since we set transform via CSS initially,
      // we drive ring with left/top via quickTo on x/y
      moveRingX(mouseX);
      moveRingY(mouseY);

      // Reveal if hidden
      body.classList.remove("cursor--hidden");
    });

    // ── Set ring initial position via gsap ────
    // GSAP quickTo x/y maps to translateX/Y
    gsap.set(ring, { x: -100, y: -100 }); // offscreen until first move

    // ── Cursor leaves/enters window ───────────
    document.addEventListener("mouseleave", () => body.classList.add("cursor--hidden"));
    document.addEventListener("mouseenter", () => body.classList.remove("cursor--hidden"));

    // ── Click feedback ────────────────────────
    document.addEventListener("mousedown", () => {
      body.classList.add("cursor--click");
      body.classList.remove("cursor--hover");
    });
    document.addEventListener("mouseup", () => {
      body.classList.remove("cursor--click");
      // Re-check if still over a hover target
      checkHover(document.elementFromPoint(mouseX, mouseY));
    });

    // ── Hover state detection ─────────────────
    // Interactive selector — everything that should trigger the expand state
    const HOVER_SEL = [
      "a",
      "button",
      ".btn",
      ".nav-link",
      ".nav-logo",
      ".project-card",
      ".skill-card",
      ".info-item",
      ".contact-link",
      ".tech-badge",
      ".edu-tag",
      ".tool-pill",
      ".project-link-btn",
      ".back-to-top",
      ".theme-toggle",
      ".section-tag",
      "[role='button']",
    ].join(", ");

    // Text/input selector
    const TEXT_SEL = "input, textarea, [contenteditable]";

    function checkHover(el) {
      if (!el) {
        body.classList.remove("cursor--hover", "cursor--text");
        return;
      }
      if (el.matches(TEXT_SEL) || el.closest(TEXT_SEL)) {
        body.classList.add("cursor--text");
        body.classList.remove("cursor--hover");
      } else if (el.matches(HOVER_SEL) || el.closest(HOVER_SEL)) {
        body.classList.add("cursor--hover");
        body.classList.remove("cursor--text");
      } else {
        body.classList.remove("cursor--hover", "cursor--text");
      }
    }

    // Use mouseover/mouseout for reliable delegation (works on dynamic DOM too)
    document.addEventListener("mouseover", (e) => checkHover(e.target));
    document.addEventListener("mouseout",  (e) => {
      if (!e.relatedTarget || e.relatedTarget === document.documentElement) {
        body.classList.remove("cursor--hover", "cursor--text");
      }
    });

    // ── Project card label on hover ───────────
    // When hovering a project card, show a subtle "VIEW" text in the ring
    // We do this by injecting a tiny span inside the ring
    const ringLabel = document.createElement("span");
    ringLabel.className = "cursor-ring-label";
    ringLabel.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(216, 216, 224, 0.7);
      opacity: 0;
      transition: opacity 0.18s ease;
      white-space: nowrap;
      pointer-events: none;
      font-family: system-ui, sans-serif;
    `;
    ring.style.position = "fixed"; // ensure relative positioning for label
    ring.style.display = "flex";
    ring.style.alignItems = "center";
    ring.style.justifyContent = "center";
    ring.appendChild(ringLabel);

    document.addEventListener("mouseover", (e) => {
      const card = e.target.closest(".project-card");
      if (card) {
        ringLabel.textContent = "VIEW";
        ringLabel.style.opacity = "1";

        // Expand ring further for project cards
        gsap.to(ring, {
          width: 64, height: 64,
          borderColor: "rgba(216,216,224,0.5)",
          duration: 0.25, ease: "power2.out",
        });
      } else {
        ringLabel.style.opacity = "0";
        // Let CSS handle the ring size reset
        gsap.killTweensOf(ring, "width,height,borderColor");
      }
    });

    // ── Scroll: keep ring in sync ─────────────
    // Ring uses fixed positioning so no scroll update needed.
    // But if Lenis is active, we ensure the dot also stays correct.
    // (mousemove fires naturally during scroll on desktop — nothing extra needed)

    console.log("%c[Cursor] Custom cursor active ✓", "color:#d8d8e0;font-size:11px");
  });
})();