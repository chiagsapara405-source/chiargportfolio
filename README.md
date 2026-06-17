# Chirag Sapara | Portfolio

Personal portfolio built with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools.

**→ [View Live Site](https://chiargportfolio.netlify.app)**

---

## Features

- **Particle system** — animated background particles on the hero section
- **Typing effect** — rotating taglines with typewriter animation
- **Scroll reveals** — sections fade and slide in via IntersectionObserver
- **Tilt + glare** — project cards respond to mouse movement with 3D tilt and specular glare
- **Skill & tool grids** — categorized skills with proficiency levels, 11 tools in a 3-column grid
- **Project showcase** — 8 project cards with screenshots, tech badges, and Code/View links
- **Stat counters** — animated numbers (8 projects, 11 skills, 11 tools)
- **Contact form** — wired to Formspree, no backend required
- **Resume** — dedicated print-optimized A4 resume page (`/resume.html`) + downloadable PDF
- **Background animation** — ambient color-shift (purple/indigo/rose) on the grid overlay
- **Fully responsive** — works on desktop, tablet, and mobile
- **Accessibility** — semantic HTML, ARIA attributes, keyboard navigation, `prefers-reduced-motion` support

---

## Sections

1. **Hero** — profile photo, typing taglines, stat counters
2. **About** — bio with quick info grid (location, degree, interests)
3. **Skills** — 11 skills across Frontend, Backend, and Other categories
4. **Projects** — 8 live projects with screenshots, stack tags, and links
5. **Tools** — 11 developer tools the author uses
6. **Experience** — work/volunteer history
7. **Education** — academic background
8. **Contact** — form + social/email links

---

## Tech Stack

| Layer   | What's used                          |
| ------- | ------------------------------------ |
| Markup  | HTML5 (semantic, ARIA attributes)    |
| Styling | CSS3 (custom properties, grid, flex, animations) |
| Logic   | Vanilla JavaScript (ES6+)            |
| Fonts   | Hanken Grotesk — Google Fonts |
| Icons   | Font Awesome 6 (free)                |
| Forms   | Formspree                            |
| Hosting | Netlify (auto-deploy from GitHub)    |

---

## Project Structure

```
chiargportfolio/
├── index.html          # Main portfolio page
├── index.css           # All styles
├── index.js            # All interactive logic
├── resume.html         # Print-optimized A4 resume
├── README.md           # You are here
└── assets/
    ├── rasoi.png
    ├── codecompass-learn.png
    ├── pluse.png
    ├── code-ez.png
    ├── swift-share.png
    ├── marshall-landing-page.png
    └── Chirag Sapara — Resume.pdf
```

---

## Color Reference — Chili Obsidian

| Role     | Hex     |
| -------- | ------- |
| Accent (primary) | `#CD1C18` (Chili Red) |
| Accent (light) | `#FFA896` (Terracotta) |
| Accent (dark)  | `#9B1313` (Deep Red) |
| Surface  | `#1f0f0d` (Burgundy-black) |
| Card     | `#382523` (Elevated surface) |
| Text     | `#fbdbd7` (Warm white) |

---

## Local Development

```bash
# No install needed — just open in a browser
start index.html

# Or serve locally with any static server
npx serve .
```

The site is pure static — edit any file and reload to see changes.

---

## Deployment

Pushed to `master` branch → GitHub → Netlify auto-deploys on push.

```bash
git add -A
git commit -m "your message"
git push origin master
```

---

## License

MIT — free to use and adapt.
