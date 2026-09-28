# CarterPCs Portfolio — Technical Stack Specification

> Final technical implementation strategy for the CarterPCs Portfolio Concept.
> Derived from PROJECT.md, DESIGN.md, CONTENT.md, RESEARCH.md, and ARCHITECTURE.md.
> **Status:** written before implementation. The core stack it recommends is what shipped: React, Vite, TypeScript, GSAP/ScrollTrigger, Lenis, CSS Modules, Vitest and Playwright. Several planned items — Three.js, a custom cursor, per-section code splitting, and the `<picture>`/asset-manifest pipeline — were deferred. See ARCHITECTURE.md Parts 1 and 5 for the implemented state.

---

## 1. Core Stack

**Framework — React (confirmed).** PROJECT.md's Technical Direction already names it. The architecture in ARCHITECTURE.md is heavily componentized — 11 distinct sections, each with its own layout and motion logic, plus shared primitives (Custom Cursor, Section Index, Menu Overlay) that need to be reusable across sections. React's component model fits directly, and it has mature, well-documented integration patterns with GSAP (`useLayoutEffect` + `gsap.context()` for scoped, cleanup-safe timelines).

**Build tool — Vite (confirmed).** Fast dev server, native ESM, first-class TypeScript support, and strong dynamic-`import()` support — the last point matters directly for the code-splitting strategy in §10.

**Language — TypeScript (confirmed).** The content layer (CONTENT.md's placeholders, once replaced with verified data) benefits from typed shapes; so does the shared `animations/` layer, where GSAP timelines, refs, and React lifecycles need to line up correctly across many sections. TypeScript catches integration mistakes here that are easy to make and easy to miss in plain JS.

**Package manager — npm.** No workspace/monorepo need exists for this project, so npm (with `package-lock.json` committed) is the simplest sufficient choice — it ships with Node and requires no extra tooling decisions. pnpm would be an acceptable alternative for disk efficiency, but isn't necessary here.

**Styling approach — CSS Modules + CSS custom properties (design tokens).** Justified in full in §6; noted here because it's a core-stack decision, not an afterthought.

All three of React, Vite, and TypeScript are **confirmed** against the architecture — none are rejected.

---

## 2. Animation Stack

| Tool | Responsibility |
| :--- | :--- |
| **GSAP (core)** | Complex, sequenced, orchestrated animation — multi-element timelines, precise easing control beyond what CSS keyframes can practically express. |
| **ScrollTrigger** | The backbone of the scroll-driven storytelling requirement: viewport-entry reveals, pinning, horizontal-scroll sequences (Hardware Experience, Creator Journey), scroll-linked parallax. |
| **Lenis** | Smooth/inertial scroll physics, synced to ScrollTrigger via GSAP's official integration pattern. Needed because native scroll behavior is inconsistent across browsers/trackpads/devices, and the cinematic pacing goal in DESIGN.md depends on a controlled, consistent scroll feel. Must be disabled (native scroll restored) under `prefers-reduced-motion`. |
| **CSS animations/transitions** | Isolated, state-driven micro-interactions that don't need scroll orchestration: hover/focus/active states, the custom cursor's idle pulse and morph transitions, button press feedback. Cheaper (GPU-accelerated, no JS execution), and don't compete with React's render cycle. |
| **Web Animations API** | **Not adopted** as a separate layer. It would duplicate GSAP's responsibility (timeline sequencing, orchestration) without adding capability GSAP doesn't already cover better, including native ScrollTrigger integration. Introducing it would mean two animation engines doing the same job — rejected to avoid that overlap. |

**Rule of thumb:** if an effect is tied to scroll position or requires coordinating multiple elements in sequence, it's GSAP+ScrollTrigger. If it's a self-contained, state-driven micro-interaction on a single element, it's CSS. Lenis only ever touches global scroll physics, never individual element animation.

---

## 3. 3D / WebGL Strategy

**Three.js is not the default.** ARCHITECTURE.md already flags Hardware Experience as the only 3D candidate in the entire site, rating it "High–Very High" complexity and explicitly scoping any 3D treatment as a stretch goal behind a CSS/GSAP-first default. This document holds that line.

- **Three.js:** justified only if Hardware Experience specifically needs true camera/depth interaction (user-controlled rotation/zoom around a real 3D model) that layered 2D imagery cannot deliver. Not justified anywhere else on the site.
- **React Three Fiber:** the correct integration layer *if and only if* Three.js is greenlit — declarative, integrates cleanly with React's mount/unmount lifecycle, avoids manual WebGL scene-teardown bugs. It does not make the case for 3D on its own; it's conditional on the Three.js decision above.
- **Pure 2D layered imagery:** the **default** strategy for Hardware Experience (and every other imagery-heavy section) — parallax-composited WebP/AVIF layers animated with GSAP. Cheaper to build and run, no WebGL context risk, and satisfies DESIGN.md's "cinematic imagery" language without requiring real geometry.
- **Pre-rendered video:** a strong alternative for the hardware-assembly sequence specifically — a short, heavily-compressed loop (real footage or a 3D animation baked to video) delivers the same visual payoff as live 3D (rotating/exploding hardware) at a fraction of the runtime cost, with zero device-capability risk.
- **WebGL scoped only to Hardware Experience:** if 3D is ever adopted, it must never be global or required for the site to function — correct scoping per ARCHITECTURE.md.

**Decision:** Hardware Experience ships with 2D layered imagery + pre-rendered video loops by default. Three.js/R3F is added later, only after a specific, justified interaction gap is identified that the 2D/video version can't cover.

**Fallback strategy:** if 3D is ever added, it is dynamically imported only when Hardware Experience nears the viewport, and the 2D/video version remains the fallback whenever WebGL is unavailable.

**Mobile behavior:** 3D is disabled unconditionally on mobile/touch; the 2D/video version is used regardless of device capability.

**Low-end device behavior:** a lightweight capability check (e.g., `navigator.deviceMemory`, `navigator.hardwareConcurrency`, or a cheap render-cost probe) runs before a WebGL context is ever requested; failure silently routes to the 2D/video fallback — 3D is a progressive enhancement, never a requirement.

**Reduced-motion behavior:** `prefers-reduced-motion: reduce` disables camera movement/auto-rotation entirely; if 3D content is shown at all in this mode, it's a static rendered frame, not an animating canvas.

---

## 4. Routing

**No React Router.** PROJECT.md and ARCHITECTURE.md both describe a single continuous-scroll experience — all 11 sections live on one route, navigated by scroll position and the Global Navigation's section index, not by URL changes. Adding a router here would introduce route configuration, code-splitting boundaries that fight the scroll-driven design, and browser-history entries for what are really just scroll anchors — complexity with no functional payoff, directly contradicting PROJECT.md's "simplicity over clutter" principle. If a standalone legal/credits page is ever needed outside the main scroll flow, a plain static HTML link is sufficient and doesn't justify pulling in a router dependency.

---

## 5. State Management

**No external state manager.** The state surface is small: active-section index (for nav highlighting), custom-cursor state, reduced-motion/breakpoint flags, and menu-overlay open/closed — mostly derived from scroll position, which GSAP/ScrollTrigger already track outside React's render cycle.

- **React state/context:** sufficient — a single lightweight context (e.g., a scroll-progress/UI-state context) plus local `useState`/`useRef` per component covers everything above.
- **Zustand:** unnecessary. Its value — low-boilerplate global state shared across many unrelated components — doesn't apply to a shallow state graph like this one.
- **Redux:** clearly unjustified. This isn't an app with complex async or business-logic state; adopting Redux here would be exactly the kind of trendy-but-unnecessary choice this document is meant to avoid.

**Decision:** React Context + hooks only. Revisit only if the section count or cross-component state coupling grows substantially beyond the current 11-section spec.

---

## 6. Styling

**Decision: CSS Modules + CSS custom properties (design tokens).**

**Why not Tailwind:** the design language is bespoke, asymmetric, and typography-driven — oversized editorial headlines, overlapping layouts, per-section custom compositions (DESIGN.md's Layout section explicitly says "avoid repetitive card grids"). Tailwind's strength is consistent, componentized UI systems with high class reuse (dashboards, forms, app UI) — the opposite of what this project needs. Across 11 highly custom sections, utility classes would accumulate into long, section-specific strings with little actual reuse benefit.

**Why not styled-components (CSS-in-JS runtime):** adds runtime style-injection cost and JS bundle weight for a project where initial load performance is an explicit, budgeted priority (§10), without solving a problem this project actually has — it doesn't need dynamic per-instance styling logic beyond what CSS custom properties already provide.

**Why CSS Modules:** scoped, collision-free styles per component/section, compiled away at build time (zero runtime cost by Vite), and pairs directly with a global token file for the shared design system. Complex responsive behavior (`clamp()`, media queries, container queries where useful) is expressed in plain CSS — no utility framework required.

**Minimum design-token set** (CSS custom properties, sourced from ARCHITECTURE.md's Global Visual System):
- **Color:** base (background/surface/text) + accent (primary/secondary), per the restrained-accent palette defined in ARCHITECTURE.md.
- **Typography:** display/heading/body font-family variables, a fluid type scale (`clamp()`-based), and a dedicated style for the large numeric section markers.
- **Spacing:** an 8px-based scale, supporting DESIGN.md's "generous whitespace" requirement.
- **Motion:** shared easing curves and duration values so GSAP timelines and CSS transitions stay visually consistent with each other.

---

## 7. Typography

**Font-loading strategy:** self-host font files rather than pulling from a third-party CDN (e.g., Google Fonts' hosted CDN). Self-hosting avoids an extra third-party DNS/connection round-trip, which directly helps the LCP budget in §10, and avoids external-request privacy considerations.

**Variable fonts:** prefer a single variable-font file per family, covering the full weight range the design needs — from "minimal body copy" light weights (DESIGN.md) up through oversized bold display headlines — rather than shipping several static weight files. One variable font typically costs less than two or three static weights combined.

**Fallback fonts:** define a system-font fallback stack (`-apple-system, "Segoe UI", Roboto, sans-serif`), sized to closely match the custom font's metrics, so text is legible immediately and the eventual font swap causes minimal layout shift (supports the CLS budget in §10).

**Licensing:** no specific typeface is selected in this document. When one is chosen, it must come from a clearly-licensed source (an open-license family, or a commercial family with confirmed web-use rights). Do not assume a typeface seen in reference material — the DESIGN.md reference video, or the caption fonts (e.g., Montserrat/Impact-style) RESEARCH.md documents in CarterPCs' own videos — is automatically cleared for use on this site; its license must be checked independently.

**Performance:** `font-display: swap` (or `optional` for the display face, if a flash of fallback text is preferable to a delayed custom font); preload the primary above-the-fold font file(s) (see §10); subset the font file to the actually-used character set if the chosen family ships a large glyph set.

---

## 8. Media Strategy

- **Images (thumbnails, portraits, hardware photography):** served via `<picture>` with AVIF → WebP → JPEG/PNG fallback chain, with responsive `srcset`/`sizes` so mobile never downloads desktop-resolution assets.
- **Transparent imagery:** AVIF/WebP (both support alpha) preferred for any transparent hardware-component cutouts used in the layered Hardware Experience; PNG is the fallback tier only, not the default.
- **Video clips:** WebM (VP9) with an MP4 (H.264) fallback for Safari/older-browser compatibility. Hero/background loops are muted, a few seconds long, and heavily compressed — they're ambient, not primary content.
- **Poster images:** every `<video>` ships a `poster` frame, so layout is stable and meaningful before video loads or plays, and so a static image is all that loads under reduced-motion/data-saving conditions.
- **Background loops:** lazy-loaded, requested only as their section nears the viewport (IntersectionObserver/ScrollTrigger-gated) — never autoplaying at full resolution above the fold by default.
- **YouTube embeds:** if any real CarterPCs videos are embedded rather than self-hosted clips, use a facade pattern — a lightweight thumbnail + play button first, with the actual `youtube-nocookie.com` iframe loaded only on click. Given how many videos RESEARCH.md's Notable Videos table references, eagerly embedding a live iframe per entry is not acceptable from a performance standpoint.
- **Lazy loading:** native `loading="lazy"` for below-the-fold images; IntersectionObserver-gated mounting for video/iframes. Only Hero-section media loads eagerly.
- **Preload rules:** only the Hero's first-paint asset (LCP image or poster) and the primary font file(s) get `<link rel="preload">`.
- **Compression:** a build-time or pre-processing image pipeline (e.g., `sharp`/Squoosh-based) targets the size budgets in §10; video is encoded specifically for web delivery, never shipped as a raw export.

---

## 9. Asset and Copyright Strategy

This project makes **no claim** that legal permission currently exists for any CarterPCs-sourced media. Rules:

- **CarterPCs imagery** (photos, screenshots, video frames): every asset is tracked as pending rights review until explicit permission or a clear, checkable fair-use/attribution basis is confirmed, consistent with PROJECT.md's Legal/Attribution section.
- **Video thumbnails/clips:** same review requirement. RESEARCH.md's Notable Videos table is a reference list of *candidates*, not a cleared asset list.
- **Platform logos** (TikTok, YouTube, Instagram, X, Snapchat): only official, unmodified brand-guideline-compliant marks, used only where the platform's own guidelines permit third-party attribution use.
- **Hardware manufacturer logos** (any GPU/CPU/case brand visible in photography): same official-guidelines-compliance rule; nothing on the site may imply manufacturer endorsement.
- **Third-party assets generally** (stock photography, icon packs, fonts): each must carry a clear, checkable license before inclusion.

A tracked asset manifest (e.g., `docs/ASSET_MANIFEST.md`, to be created once real assets are sourced) should log per asset: source, license/permission status, and reviewed-by/date. This document recommends that practice but does not create the manifest itself, since no real assets have been sourced yet.

---

## 10. Performance Budget

| Metric | Target |
| :--- | :--- |
| Initial JS bundle (main chunk, gzipped) | ≤ 150KB |
| Total initial page weight (HTML+CSS+JS+critical media, excluding lazy-loaded sections) | ≤ 2MB |
| Hero video/loop (if used) | ≤ 2MB, ≤ 6s, web-compressed |
| Individual above-the-fold image | ≤ 200KB (responsive/compressed) |
| Largest Contentful Paint (LCP) | ≤ 2.5s on a throttled "Fast 3G" / mid-tier mobile profile |
| Cumulative Layout Shift (CLS) | ≤ 0.1 |
| Interaction to Next Paint (INP) | ≤ 200ms |
| Animation frame rate | sustained 60fps desktop/mid-tier mobile during scroll sequences; degrade gracefully rather than drop frames on low-end devices |

**Strategies:**
- **Code splitting:** one dynamically-imported chunk per major section, so the initial bundle contains only Intro/Loader + Hero + the shared shell (nav, cursor, motion utilities).
- **Lazy loading:** every section beyond Hero mounts its heavy media/animation logic only on viewport approach, not on initial page load.
- **Dynamic imports:** section-specific GSAP plugins and any 3D library (§3) are imported only if/when their section is reached — never bundled into the initial load.
- **Video loading:** `preload="none"` + poster by default; actual video requested only on viewport entry or user interaction.
- **WebGL loading:** entirely deferred behind Hardware Experience and behind the device-capability/reduced-motion checks in §3.
- **Font loading:** self-hosted, preloaded, subset, single variable-font file per family (§7).
- **Asset preloading:** limited to the Hero's LCP asset and primary font file(s) — everything else follows natural lazy/viewport-gated loading.

---

## 11. Accessibility

**Target: WCAG 2.2 AA where practical**, with explicit accommodation for the experimental motion patterns (horizontal scroll-hijacking, custom cursor) that aren't accessible by default.

- **Semantic HTML:** real `<nav>`, `<section>`/`<article>` elements with headings in logical order (one site `<h1>`, one `<h2>` per major section); interactive elements use `<button>`/`<a>` per their actual semantics — never a clickable `<div>`.
- **Keyboard navigation:** every interactive element (section index, menu overlay, video play triggers) is reachable and operable via keyboard; horizontal scroll-hijacked sequences also expose arrow-key or visible next/previous controls, not scroll-only interaction.
- **Focus states:** visible, high-contrast focus rings on every interactive element, custom-styled to match the design system but never removed without a replacement.
- **Screen readers:** meaningful `alt` text on informative images (decorative loops get `alt=""`); the active-section indicator is announced via ARIA if it conveys information not otherwise available; the custom cursor and purely decorative motion are hidden from the accessibility tree (`aria-hidden`).
- **Reduced motion:** `prefers-reduced-motion: reduce` disables parallax, kinetic-typography letter-splitting, horizontal scroll-hijacking, and Lenis inertia sitewide via one shared hook (e.g., `useReducedMotion`), falling back to simple fades and native scroll — implemented once, reused everywhere, not reimplemented per section.
- **Video controls:** any video with audio exposes accessible play/pause/mute/caption controls; muted ambient/background loops are exempt from requiring controls but remain pausable if long-running (WCAG 2.2.2).
- **Contrast:** all text-on-background and accent-color combinations are checked against WCAG AA ratios when finalizing the color tokens in §6 — the restrained-accent approach from ARCHITECTURE.md helps keep this achievable.
- **Alt text:** written per-image at content time, descriptive (e.g., component name for hardware photography), never left as a filename or empty for informative imagery.
- **Custom cursor fallback:** purely an enhancement — native cursor and default hover/focus states remain fully functional if the custom cursor is disabled (touch devices, reduced motion, or initialization failure).

---

## 12. Responsive Implementation

**Breakpoints** (content-driven reference ranges, not device-specific):
- Mobile: up to ~767px
- Tablet: ~768px–1023px
- Desktop: ~1024px and up, with additional room for asymmetric compositions on large/ultra-wide viewports

Per ARCHITECTURE.md's Responsive Strategy, each breakpoint gets its **own composition per section**, not a scaled-down desktop layout:

| Effect | Desktop | Tablet | Mobile |
| :--- | :--- | :--- | :--- |
| Custom cursor | Full (all states) | Full if pointer is fine/hover-capable, else disabled | Disappears — replaced by tap/hold feedback |
| Horizontal scroll sequences | Full scroll-hijacked sequence | Simplified sequence or swipe-converted | Converts to a vertical swipeable stack |
| Section index (nav) | Full vertical marker stack | Condensed marker set | Collapses to a slim progress bar |
| Parallax/depth layers | Full layer count | Reduced layer count | Minimal or disabled |
| Kinetic typography | Full character/word-level animation | Same, timing may simplify | Simplifies to fade/slide reveals |
| Magnetic buttons / hover distortion | Full | Full if hover-capable | Disappears — replaced by press/tap feedback |

**Implementation note:** gate hover-dependent effects with `@media (hover: hover) and (pointer: fine)`, not viewport width alone — a touch-capable laptop shouldn't lose desktop behavior for being narrow, and a small precise-pointer device shouldn't get touch fallbacks it doesn't need.

---

## 13. Testing

Lightweight and practical — this is a portfolio site, not a transactional application, so test infrastructure is intentionally kept proportionate.

- **Vitest:** unit tests for pure logic — content-data shape validation (the typed replacement for CONTENT.md's placeholders), and utility functions (breakpoint/reduced-motion detection, token/easing lookups). Fast, Vite-native, minimal setup.
- **React Testing Library:** limited smoke tests — each of the 11 sections renders without crashing, and critical accessibility affordances exist (nav links present, alt text present, heading order correct). Not exhaustive interaction testing.
- **Playwright:** a small set of end-to-end smoke tests — page loads, Hero renders, scroll reaches the Final Cinematic/Credits sections, reduced-motion mode doesn't crash the page, mobile viewport renders without horizontal overflow. Not a full cross-browser matrix or visual-regression suite.

**What's actually tested:** build correctness, the accessibility baseline, and content-data integrity (no missing required fields — directly supporting PROJECT.md's and CONTENT.md's "verify before publishing" requirement). **What's intentionally not tested:** pixel-perfect animation timing, exhaustive cross-browser visual snapshots, or 100% code coverage — disproportionate for this project's scope.

---

## 14. Code Quality

- **ESLint**, with `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` (directly supports §11), and the TypeScript ESLint plugin.
- **Prettier**, run via a pre-commit hook (`lint-staged` + `husky`) or at minimum a `format` script, to keep diffs clean across many hand-tuned section files.
- **TypeScript strictness:** `strict: true` in `tsconfig.json` — worth the upfront friction given how much data and how many refs pass between section and animation modules.
- **Lint scripts:** `lint`, `lint:fix`, `format`, `typecheck` (`tsc --noEmit`) as standard `package.json` scripts.
- **Build checks:** `typecheck` + `lint` + `build` run before any deploy (CI or a pre-push hook) — a few fast scripts, not a heavyweight pipeline.

---

## 15. Project Structure

```
src/
├── components/   # small, reusable UI primitives shared across sections
│                 #   (CustomCursor, SectionIndex, MenuOverlay, ResponsiveVideo, Icon, ...)
├── sections/     # one folder per major section — Intro, Hero, CreatorIntro,
│                 #   FeaturedContent, HardwareExperience, ContentUniverse,
│                 #   CreatorJourney, SelectedVideos, CreatorIdentity,
│                 #   FinalCinematic, Credits — each owns its layout,
│                 #   section-scoped CSS Module, and section-specific motion setup
├── hooks/        # useReducedMotion, useScrollProgress, useBreakpoint,
│                 #   useLenis, useSectionInView, ...
├── animations/   # GSAP timeline factories, ScrollTrigger setup helpers, shared
│                 #   easing/duration constants — kept separate from components
│                 #   so timelines stay reusable and testable in isolation
├── styles/       # tokens.css (design tokens/custom properties), global.css,
│                 #   shared CSS Module mixins/utilities
├── data/         # typed content objects — the eventual, verified replacement
│                 #   for CONTENT.md's placeholders — plus asset manifest metadata
├── utils/        # generic helpers not specific to animation or content
└── assets/       # images, video, fonts — organized by section/purpose,
                  #   pre-optimized before entering the repo
```

This adds one thing to the prompt's suggested structure: a dedicated `data/` directory, separate from `utils/`. Content verification is a first-class, repeatedly-stated concern across PROJECT.md and CONTENT.md ("must be verified/sourced before publication"), so keeping typed content data visibly separate from generic utility code makes it easy to audit what's real versus placeholder at a glance.

---

## 16. Environment Variables

**Minimal.** This is a static, content-driven site with no backend of its own. Categories, if/when needed:

- A build-mode flag (e.g., gating whether explicitly-placeholder content from CONTENT.md can appear in a production build) — relevant given how much of that document is marked as placeholder.
- Analytics/monitoring site ID, only if analytics is added later (not currently specified in any source doc) — a public, client-safe value if used, not a secret.
- Third-party embed configuration (e.g., a YouTube Data API key, only if the facade pattern in §8 is upgraded to fetch live metadata) — treated as an env var regardless of sensitivity, but note that any *actual secret* key must never be exposed client-side.

No server-side secrets are anticipated for this project's current scope. If any are introduced later (e.g., a future contact-form backend), they must live server-side only and never be committed to the repository.

---

## 17. Deployment

| Option | Fit |
| :--- | :--- |
| **Vercel** | Excellent Vite SPA support, zero-config, automatic HTTPS, easy custom domain, strong CDN caching for the video/image-heavy asset load this project has, automatic preview deployments per branch/PR. Strong fit. |
| **Netlify** | Essentially equivalent to Vercel for a static Vite SPA — zero-config, custom domain, HTTPS, CDN caching. Strong fit, good backup. |
| **Cloudflare Pages** | Also a strong fit — excellent global CDN performance (relevant for media delivery), generous free tier; marginally more manual setup than Vercel/Netlify but very capable. |
| **GitHub Pages** | Workable but weaker — no built-in image/video optimization or sophisticated edge caching, more manual custom-domain HTTPS setup. Not ideal for a media-heavy cinematic site. |
| **Hostinger static hosting** | Workable as traditional shared hosting, but lacks the CDN/edge caching and zero-config CI/CD integration the other options provide by default — more operational overhead for no benefit here. |

**Recommendation: Primary — Vercel.** Best-in-class Vite SPA deploy experience, automatic preview deployments, strong CDN for this project's video/image load, trivial custom-domain + HTTPS setup.
**Backup — Cloudflare Pages.** Comparable static-hosting quality with particularly strong CDN performance for global media delivery, easy to migrate to if ever needed.

---

## 18. Browser Support

**Target:** latest two major versions of Chrome, Edge, Firefox, and Safari (desktop), plus current iOS Safari and Android Chrome. This covers the large majority of a general-audience portfolio site's traffic while allowing modern CSS (custom properties, `clamp()`) and modern media formats (AVIF/WebP/WebM) without heavy polyfilling.

**Progressive enhancement for unsupported effects:**
- If GSAP/ScrollTrigger fails to load or JS is disabled: content remains readable via static HTML/CSS — sections are visible by default, with animation layered on top rather than gating visibility.
- No WebGL support: automatic fallback to the 2D/video Hardware Experience treatment (§3) — never a hard requirement.
- No AVIF/WebP support: the `<picture>` fallback chain resolves to JPEG/PNG automatically.
- Bleeding-edge CSS features are treated as enhancements only, never load-bearing for layout — a working fallback layout always exists.
- Reduced-motion and low-end-device paths are already covered in §3, §10, §11, and §12 — the baseline experience works everywhere; the cinematic layer is additive.

---

## 19. Required vs Optional Technology

| Technology | Required / Optional / Avoid | Purpose | Reason |
| :--- | :--- | :--- | :--- |
| React | Required | UI framework | Specified in PROJECT.md; fits the component-per-section architecture |
| Vite | Required | Build tool / dev server | Specified in PROJECT.md; fast, native TS/ESM, strong code-splitting |
| TypeScript | Required | Language | Type-safety across content data, animation utilities, 11 sections |
| GSAP | Required | Core animation engine | Sequenced/orchestrated motion beyond CSS's practical scope |
| ScrollTrigger | Required | Scroll-driven animation | Backbone of the scroll-storytelling requirement |
| Lenis | Recommended (near-required) | Smooth/inertial scroll | Consistent cross-browser scroll feel; official ScrollTrigger integration |
| Three.js | Optional | 3D rendering | Only if Hardware Experience needs true 3D interaction beyond 2D/video (§3) |
| React Three Fiber | Optional | React/Three.js integration layer | Only relevant if Three.js is actually adopted |
| React Router | Avoid | Client-side routing | Single continuous-scroll experience; no multi-page/route need |
| Zustand | Avoid | Global state store | State surface is small enough for React Context/hooks |
| Tailwind | Avoid | Utility-first CSS | Bespoke, asymmetric, typography-driven design doesn't fit utility-class patterns |
| Vitest | Required | Unit testing | Fast, Vite-native, covers content-data/util logic |
| Playwright | Recommended | E2E smoke testing | Minimal but valuable coverage of load/scroll/reduced-motion/mobile paths |

---

## 20. Final Recommended Stack

**CORE**
- React
- Vite
- TypeScript
- npm

**MOTION**
- GSAP
- ScrollTrigger
- Lenis (smooth scroll)
- CSS animations/transitions (isolated micro-interactions)

**STYLING**
- CSS Modules
- CSS custom properties (design tokens)

**3D (conditional — not part of the default build)**
- Default: 2D layered imagery + pre-rendered video
- Three.js + React Three Fiber only if a specific, justified interaction gap emerges for Hardware Experience

**TESTING**
- Vitest + React Testing Library (unit/component smoke tests)
- Playwright (minimal E2E smoke tests)

**CODE QUALITY**
- ESLint (+ react-hooks, jsx-a11y, TypeScript plugins)
- Prettier
- `tsc --noEmit` in strict mode

**DEPLOYMENT**
- Vercel (primary)
- Cloudflare Pages (backup)

**EXPLICITLY NOT USED**
- React Router
- Zustand / Redux
- Tailwind CSS / styled-components
- Web Animations API as a separate animation layer

---

## 21. Implementation Order

1. Initialize Vite (React + TypeScript template).
2. Configure `tsconfig.json` (strict mode) and base ESLint/Prettier setup.
3. Install core dependencies: React, GSAP (+ ScrollTrigger), Lenis.
4. Establish the folder structure (§15) with empty section placeholders.
5. Define design tokens (`styles/tokens.css`) from ARCHITECTURE.md's Global Visual System — colors, type scale, spacing, motion easings — *before* building the shell, so sections are styled against final token values instead of retrofitted later.
6. Build the static shell: semantic scaffolding for all 11 sections (unstyled/minimally styled) and the Global Navigation skeleton, with no animation yet — confirms structure, landmarks, and heading order before motion is layered on.
7. Implement the motion foundation: Lenis + ScrollTrigger wiring, shared `animations/` utilities, `useReducedMotion`/`useBreakpoint` hooks — built and verified against one simple section before scaling to the rest.
8. Build sections progressively in narrative order (Intro/Loader → Hero → Creator Introduction → Featured Content → Hardware Experience [2D/video version] → Content Universe → Creator Journey → Selected Videos → Creator Identity → Final Cinematic → Credits), styling, animating, and checking responsive behavior for each as it's built rather than at the end.
9. Wire up Custom Cursor and hover/touch-capability detection once enough sections exist to test hover states meaningfully.
10. Add lazy-loading/code-splitting per section (§10) and run the performance budget checks from this document.
11. Add optional 3D last, scoped only to Hardware Experience, and only if justified per §3 — behind its own dynamic import and fallback path.
12. Add Vitest/Playwright coverage for the finished shell (§13), then wire up the CI build checks (§14) before the first deploy.
13. Deploy an early pass to Vercel (§17) — even with placeholder content — to validate the performance budget against real hosting conditions, then iterate content and assets behind the reverification requirements in RESEARCH.md and CONTENT.md before public release.

This adjusts the prompt's example sequence in two ways: design tokens are established *before* the static shell (step 5, ahead of step 6) so the shell is built directly against final values rather than retrofitted; and an early low-fidelity deploy is pulled forward (step 13, rather than assumed to be last) so real-world performance is validated well before public release, not only at the end.
