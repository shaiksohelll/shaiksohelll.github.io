# Portfolio

**Live → [shaiksohelll.github.io](https://shaiksohelll.github.io)**

Personal portfolio of **Shaik Sohel** — full-stack developer, Hyderabad.
Typography-led editorial design (Bodoni Moda + DM Sans, paper / ink / signal red),
built as a single static file with no build step.

## Featured systems

| Project | What it is | Stack | Link |
| --- | --- | --- | --- |
| **Klar** | Job-market analytics platform ingesting from two independent APIs | React · Node.js · Express · MongoDB | [Live](https://klar-dev.onrender.com/) |
| **Pakka** | Milestone escrow reference implementation with server-enforced money-state transitions | Next.js 15 · TypeScript strict · Supabase · PostgreSQL | [Live](https://mypakka.vercel.app/login) |
| **Hyderabad Metro Go** | Client-side route planner — deque-based 0-1 BFS over 59 stations, 3 interchanges, 10 fare slabs | Vanilla JavaScript · Bootstrap 5 | [Live](https://shaiksohelll.github.io/Hyderabad-Metro-Go/) |
| **Bhasha Seva** | Multilingual voice-corpus collection with offline AI transcription review — Yukti National Innovation Repository, TRL 4 | Python · Streamlit · WebRTC · Ollama | [Certificate](https://shaiksohelll.github.io/yukti-certificate.pdf) |

## Engineering decisions

- **Static by default.** One self-contained `index.html` — markup, styles, and interaction. No framework, no bundler, no build. GitHub Pages serves it as-is; `.nojekyll` disables Jekyll processing.
- **Progressive enhancement.** Content is never gated behind JavaScript. Reveal animations apply only under a `.js` class set by an inline bootstrap, backed by a 1.5 s fail-open watchdog and a `prefers-reduced-motion` override. If scripts fail, the page is still fully readable.
- **Local assets.** Avatar, resume PDF, and certificate PDF ship from the repository root. The only third-party dependency is Google Fonts, with system-font fallbacks.
- **Accessible.** Semantic landmarks, skip link, visible focus states, ARIA-labeled sections, keyboard-operable navigation.

## Repository layout

- `index.html` — the entire site
- `avatar.png` — header portrait
- `shaik-sohel-resume.pdf` — downloadable resume
- `yukti-certificate.pdf` — IIC / Yukti recognition certificate
- `.nojekyll` — GitHub Pages passthrough

## Local preview

Open `index.html` in a browser. No server, no install.

## Deployment

Push to `main` → GitHub Pages deploys automatically.

© 2026 Shaik Sohel
