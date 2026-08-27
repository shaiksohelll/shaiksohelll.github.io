# Shaik Sohel — Portfolio

**Live → [shaiksohelll.github.io](https://shaiksohelll.github.io)**

Personal portfolio of **Shaik Sohel** — full-stack developer, Hyderabad. The site is a typography-led editorial portfolio with four source-backed project case studies and static GitHub Pages delivery.

## Architecture

This is a build-free static site. There is no framework, bundler, npm install, or runtime server in production. GitHub Pages serves the HTML, stylesheet, local assets, and pinned CDN enhancements directly. `.nojekyll` remains in the repository root to preserve passthrough behavior.

The homepage and four project routes are real static documents:

```text
index.html
404.html
styles.css
site-core.js
barba-layer.js
gsap-layer.js
motion-layer.js
anime-layer.js
work/klar/index.html
work/pakka/index.html
work/hyderabad-metro-go/index.html
work/bhasha-seva/index.html
avatar.png
shaik-sohel-resume.pdf
yukti-certificate.pdf
.nojekyll
```

The persistent global shell contains only the header/navigation, skip link, transition overlay, and live region. The homepage-only scroll rule is inside the homepage container. Every page-specific title, content, footer, case-study navigation, and project evidence lives inside one replaceable `data-barba="container"` with a namespace.

## Barba namespaces

| Route | Namespace | Purpose |
| --- | --- | --- |
| `/` | `home` | Portfolio homepage and complete work/experience/education story |
| `/work/klar/` | `project-klar` | Klar case study |
| `/work/pakka/` | `project-pakka` | Pakka case study |
| `/work/hyderabad-metro-go/` | `project-metro` | Hyderabad Metro Go case study |
| `/work/bhasha-seva/` | `project-bhasha` | Bhasha Seva case study |

Each project route is directly refreshable, uses root-safe asset paths, provides previous/next project links, and retains its separate live-system or certificate action. External links, mail links, telephone links, downloads, new-tab links, and same-document hash links are intentionally left to native browser behavior.

## Lifecycle and motion ownership

`barba-layer.js` owns route replacement, namespace-aware transitions, metadata updates, announcements, focus handoff, hash scrolling, and scroll restoration. `site-core.js` owns the singleton global shell, one optional Lenis instance, page reveal setup, and explicit cleanup registration.

GSAP owns SplitText, ScrollTrigger, and restrained project-index movement. Anime.js owns page-scoped SVG rule drawing, evidence counts, and the homepage intro dash. Motion owns page-scoped hover springs and the homepage-only scroll rule. Every page module returns cleanup handles; generated SVG nodes, observers, timers, split instances, hover subscriptions, tweens, and ScrollTriggers are released before the next container is initialized.

The transition overlay has a fail-open timeout. If Barba, a CDN module, or a transition callback fails, native browser navigation remains available and content is not hidden behind JavaScript. Content is visible by default; `.js` only opts into enhancement styles. A document-level watchdog and page-level watchdog reveal content after 1.5 seconds. `prefers-reduced-motion: reduce` disables smooth scrolling, transition travel, counters, parallax, and reveal hiding.

## Content truth

Project copy is limited to evidence present in the verified portfolio record and source repositories. Klar claims are grounded in its React/Vite client, Express/MongoDB server, Adzuna/JSearch ingestion, rate-aware requests, day-bucketed skill history, and analytics routes. Pakka claims are grounded in its Next.js/React/Supabase/PostgreSQL stack, authenticated transition RPCs, explicit authorization and state checks, ordered row locking, numeric monetary fields, partial unique indexes, operation-specific duplicate protection, and paired transfer paths. The detailed Pakka case study labels its approved aggregate counts as “Deployed schema audit snapshot — 27 August 2026”: 4 transition RPCs, 38 deployed migration records, and 45 deployed public RLS policies. It makes no product-traction or verified lifecycle-instrumentation claim and uses a concise measurement boundary instead. Hyderabad Metro Go claims are grounded in the actual vanilla JavaScript route engine, deque-based 0-1 BFS, three line maps, 59 stations, three interchange nodes, ten fare slabs, facilities, parking, and five-item recent-trip localStorage. Bhasha Seva uses only resume/certificate-backed facts and has no deployed launch link.

## Local preview

Barba needs an HTTP origin to exercise route interception. Run any static server from the repository root, for example:

```bash
npx serve -l 4173 .
```

Opening `index.html` directly still provides fully readable content and native links, but `file://` is not a valid test of Barba transitions.

## Deployment

Push the feature branch and open a pull request against `main`. After review, merging to `main` allows GitHub Pages to deploy automatically. Do not add a build step or convert the project to a framework without revisiting the static fallback and direct-route assumptions.

## Accessibility and performance

The site uses semantic landmarks, one heading hierarchy per route, real anchors, visible focus states, a skip link, an `aria-live` page announcement, an aria-hidden transition layer, mobile navigation, reduced-motion behavior, and no-JavaScript readability. It uses root-safe local assets, waits for critical layout images before page-specific motion, avoids aggressive prefetching on save-data connections, and keeps motion on transform/opacity/clip-path rather than layout properties.

© 2026 Shaik Sohel
