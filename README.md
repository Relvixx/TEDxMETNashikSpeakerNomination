<p align="center">
  <a href="https://www.tedxmetnashik.in/speaker">
    <img src="assets/banner.svg" alt="TEDxMET Nashik — Speaker Nominations 2026" width="900" />
  </a>
</p>

<p align="center">
  <i>Crowdsource exceptional speakers for TEDxMET Nashik 2026 through a polished, end-to-end nomination pipeline</i>
</p>

<p align="center">
  <a href="https://www.tedxmetnashik.in/speaker"><img src="https://img.shields.io/badge/🔴_Live_Demo_→-tedxmetnashik.in-E62B1E?style=for-the-badge" alt="Live Demo" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/EmailJS-FF6F00?style=for-the-badge&logoColor=white" alt="EmailJS" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />
</p>

<br />
<hr />

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Submission Flow](#submission-flow)
4. [Tech Stack Deep Dive](#tech-stack-deep-dive)
5. [Development Phases](#development-phases)
6. [Capstone Highlight](#capstone-highlight)
7. [Getting Started](#getting-started)
8. [Usage](#usage)
9. [Engineering Notes](#engineering-notes)
10. [Roadmap](#roadmap)
11. [Contributing](#contributing)
12. [License](#license)

## Overview

A full-stack speaker nomination platform for TEDxMET Nashik 2026 — the independently organized TEDx event at MET Nashik. Nominators submit speaker candidates through a multi-field form with drag-and-drop file uploads; submissions persist to Supabase (database + object storage), and dual EmailJS notifications fire to both the admin team and the nominator. The landing page doubles as a "coming soon" teaser with animated hero visuals and mouse-tracking glow effects.

### Key Features

- [x] Multi-step form with real-time client-side validation
- [x] Drag-and-drop file uploads to Supabase Storage (max 5 files, 10 MB each)
- [x] Dual email notifications via EmailJS (admin + nominator confirmation)
- [x] Scroll-reveal animations with IntersectionObserver
- [x] Interactive mouse-following glow effect on desktop
- [x] Animated stat counters with eased cubic interpolation
- [x] Fully responsive layout with mobile hamburger menu
- [x] SEO-optimized with Open Graph and Twitter Card meta tags

*Built with: `HTML5, CSS3, Vanilla JavaScript, Supabase (PostgreSQL + Storage), EmailJS`.*

## System Architecture

The nomination pipeline operates as a serverless frontend-to-BaaS architecture with zero custom backend code. All persistence, storage, and email delivery delegate to managed services.

```mermaid
graph TB
    subgraph CLIENT["🌐 Client Browser"]
        LP["Landing Page<br/><code>index.html</code>"]
        NF["Nomination Form<br/><code>speaker/index.html</code>"]
        VAL["Client-Side Validation<br/><code>speaker/script.js</code>"]
        FU["File Upload Engine<br/>Drag & Drop + Progress"]
    end

    subgraph SUPABASE["☁️ Supabase (BaaS)"]
        DB[("PostgreSQL<br/><code>nominations</code> table")]
        ST[("Object Storage<br/><code>nominations</code> bucket")]
        RLS["Row Level Security<br/>INSERT-only (anon)"]
    end

    subgraph EMAILJS["📧 EmailJS"]
        ADM["Admin Notification<br/>Template"]
        USR["Nominator Confirmation<br/>Template"]
    end

    LP -->|CTA Click| NF
    NF -->|Submit| VAL
    VAL -->|Valid| FU
    FU -->|"Files (≤5, ≤10MB each)"| ST
    VAL -->|Form Data + File URLs| DB
    DB -.->|Success| EMAILJS
    VAL -->|Template Params| ADM
    VAL -->|Template Params| USR
    RLS -->|Enforces| DB

    style CLIENT fill:#1a1a2e,stroke:#E62B1E,stroke-width:2px,color:#fff
    style SUPABASE fill:#1a2e1a,stroke:#3FCF8E,stroke-width:2px,color:#fff
    style EMAILJS fill:#2e1a1a,stroke:#FF6F00,stroke-width:2px,color:#fff
    style DB fill:#0d2818,stroke:#3FCF8E,color:#fff
    style ST fill:#0d2818,stroke:#3FCF8E,color:#fff
    style RLS fill:#0d2818,stroke:#3FCF8E,color:#fff
    style ADM fill:#2e1008,stroke:#FF6F00,color:#fff
    style USR fill:#2e1008,stroke:#FF6F00,color:#fff
```

<details>
<summary>📁 Repository structure</summary>

```text
.
├── index.html              # Coming-soon landing page
├── style.css               # Landing page styles (glow, hero, nav, footer)
├── script.js               # Landing page JS (scroll-reveal, mouse-follow glow)
├── config.example.js       # Template for Supabase + EmailJS credentials
├── config.js               # Active credentials (gitignored in production)
├── assets/
│   ├── banner.svg          # Animated SVG hero banner for README
│   ├── favicon.svg         # SVG favicon
│   └── logo-black.png      # TEDxMET Nashik brand logo
├── speaker/
│   ├── index.html          # Speaker nomination form page
│   ├── style.css           # Form styles (criteria cards, file upload, toast)
│   ├── script.js           # Form logic (validation, Supabase, EmailJS, uploads)
│   └── config.js           # Speaker-page credentials (mirrors root config)
├── .gitignore
└── README.md
```

</details>

## Submission Flow

Step-by-step sequence of a nomination from form fill to confirmation email. Every arrow represents an actual async operation in the codebase.

```mermaid
sequenceDiagram
    actor N as Nominator
    participant F as Form UI
    participant V as Validator
    participant S as Supabase Storage
    participant D as Supabase DB
    participant E as EmailJS
    participant A as Admin

    N->>F: Fills nomination form
    N->>F: Drags & drops files (optional)

    F->>V: Submit event fires
    V->>V: Validate all required fields
    V->>V: Validate email format (regex)
    V->>V: Validate phone (10-15 digits)

    alt Validation fails
        V-->>F: Mark fields with error state
        F-->>N: Scroll to first error
    end

    rect rgb(13, 40, 24)
        Note over F,S: File Upload Phase
        F->>F: Show progress bar
        loop For each file (≤5)
            F->>S: Upload file to submissions/{user}_{timestamp}/
            S-->>F: Return storage path
            F->>F: Update progress (n of total)
        end
    end

    rect rgb(13, 40, 24)
        Note over F,D: Database Persistence
        F->>D: INSERT nomination row
        D->>D: RLS policy check (anon INSERT)
        D-->>F: Confirm write
    end

    rect rgb(46, 16, 8)
        Note over F,E: Email Notifications (best-effort)
        F->>E: Send admin notification
        E-->>A: 📧 New nomination alert
        F->>E: Send nominator confirmation
        E-->>N: 📧 "Your nomination was received"
    end

    F->>F: Hide form, show success panel
    F-->>N: Display "What Happens Next" steps
```

## Tech Stack Deep Dive

<table>
<tr>
<td width="80" align="center"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="40" alt="HTML5"/><br /><b>HTML5</b></td>
<td><b>Semantic Structure & SEO</b><br />Two-page static architecture with full Open Graph, Twitter Card, and structured meta. ARIA attributes on all form controls. Semantic landmarks (<code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;footer&gt;</code>) ensure screen-reader compatibility.</td>
</tr>
<tr>
<td width="80" align="center"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="40" alt="CSS3"/><br /><b>CSS3</b></td>
<td><b>Premium Visual Layer</b><br />Custom-property design system. Radial-gradient glow effects with <code>mix-blend-mode</code>. CSS Grid for the nomination form layout. <code>@media</code> breakpoints for mobile-first responsiveness. Transition choreography on scroll-reveal elements with staggered delays.</td>
</tr>
<tr>
<td width="80" align="center"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" width="40" alt="JavaScript"/><br /><b>JavaScript</b></td>
<td><b>Interaction Engine</b><br />Zero dependencies for the landing page. <code>IntersectionObserver</code> API for scroll-triggered reveals and stat counter animations. <code>requestAnimationFrame</code> loop with damped interpolation (<code>0.04</code> factor) for mouse-following glow. Real-time form validation with field-level error clearing on <code>input</code> events.</td>
</tr>
<tr>
<td width="80" align="center"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" width="40" alt="Supabase"/><br /><b>Supabase</b></td>
<td><b>Backend-as-a-Service</b><br />PostgreSQL database stores nomination records (<code>nominations</code> table). Object Storage bucket handles file uploads with unique per-submission folders (<code>submissions/{name}_{timestamp}_{randomId}/</code>). Row Level Security restricts the anon role to <code>INSERT</code> only — no reads, updates, or deletes.</td>
</tr>
<tr>
<td width="80" align="center"><img src="https://img.icons8.com/fluency/48/email.png" width="40" alt="EmailJS"/><br /><b>EmailJS</b></td>
<td><b>Transactional Email</b><br />Client-side email dispatch — no SMTP server required. Two template IDs: one for admin team alerts (includes all form data + file names), one for nominator confirmation (personalized "thank you"). Fire-and-forget pattern: email failures never block the Supabase write.</td>
</tr>
</table>

## Development Phases

| Phase | Goal | Status | Outcome |
|-------|------|--------|---------|
| v0.1 | Coming-soon landing page | ✅ Done | Animated hero with glow effect and CTA |
| v0.2 | Speaker nomination form | ✅ Done | Multi-field form with validation and EmailJS |
| v0.3 | Supabase integration | ✅ Done | Database persistence + Storage file uploads |
| v0.4 | File upload UX | ✅ Done | Drag-and-drop, progress bar, 5-file / 10 MB limits |
| v0.5 | Mobile responsiveness | ✅ Done | Hamburger menu, responsive grid, touch-optimized |
| v0.6 | Success flow | ✅ Done | Post-submission panel with "What Happens Next" steps |

> **Note:** Status indicators follow the convention: ✅ Complete · 🔄 In Progress · 🗓 Planned.

## Capstone Highlight

- Nomination data persists to Supabase PostgreSQL with file attachments in Supabase Storage — zero server-side code required
- Dual-channel email delivery (admin alert + nominator confirmation) ensures no submission goes unnoticed
- Client-side file validation enforces type, size (10 MB), and count (5 files) constraints before upload begins
- Mouse-tracking radial glow on the landing page creates a premium, living aesthetic
- IntersectionObserver-driven animations eliminate layout thrashing — no scroll event listeners
- Graceful degradation: email failures never block database writes; upload failures never block nomination saves

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A [Supabase](https://supabase.com) project with a `nominations` table and a `nominations` storage bucket
- An [EmailJS](https://www.emailjs.com) account with a configured service and two templates (admin + user)

### Installation

```bash
# Clone the repository
git clone https://github.com/Relvixx/TEDxMETNashikSpeakerNomination.git
cd TEDxMETNashikSpeakerNomination

# Create your credentials file from the template
cp config.example.js config.js
cp config.example.js speaker/config.js

# Edit both config.js files with your Supabase and EmailJS credentials
# (see Environment Variables below)
```

### Environment Variables

Both `config.js` files (root and `speaker/`) expose credentials via `window.CONFIG`. Populate them as follows:

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL (e.g. `https://xxx.supabase.co`) | ✅ |
| `SUPABASE_ANON` | Supabase anonymous/public API key | ✅ |
| `EMAILJS_PUBLIC_KEY` | EmailJS account public key (Account → API Keys) | ✅ |
| `EMAILJS_SERVICE_ID` | EmailJS email service ID | ✅ |
| `EMAILJS_TEMPLATE_ADMIN` | EmailJS template ID for admin notification | ✅ |
| `EMAILJS_TEMPLATE_USER` | EmailJS template ID for nominator confirmation | ✅ |

## Usage

```bash
# Option 1: Open directly in a browser
open index.html                    # macOS
start index.html                   # Windows

# Option 2: Serve with any static file server
npx serve .                        # serves on http://localhost:3000
# or
python -m http.server 8080         # serves on http://localhost:8080

# Navigate to /speaker to access the nomination form
# Navigate to / for the coming-soon landing page
```

> [!TIP]
> Use a local HTTP server (Option 2) rather than opening files directly. The `speaker/` page loads scripts from absolute paths (`/speaker/script.js`), which only resolve correctly over HTTP — not from `file://` URLs.

## Engineering Notes

> [!NOTE]
> **Credential architecture:** Supabase and EmailJS keys are loaded at runtime via `window.CONFIG` from a separate `config.js` file. This pattern keeps secrets out of the main source files while avoiding a build step. The `config.example.js` template ships with the repo; the real `config.js` should be gitignored in production deployments.

> [!IMPORTANT]
> **Supabase Row Level Security:** The anon key grants direct insert access to the `nominations` table. Ensure your Supabase RLS policies restrict operations to `INSERT` only for the anon role — never expose `SELECT`, `UPDATE`, or `DELETE` on this table without authentication.

> [!WARNING]
> **Exposed credentials:** The current `config.js` contains live Supabase and EmailJS keys committed to version control. Rotate these keys immediately if the repository is public, and add `config.js` and `speaker/config.js` to `.gitignore` to prevent future leaks.

### Known Limitations

- No server-side validation — all input constraints are enforced client-side only
- File uploads lack virus scanning or content-type verification beyond MIME/extension checks
- EmailJS free tier limits monthly email volume; high-traffic periods may silently drop notifications
- No CAPTCHA or rate limiting — the form is susceptible to automated spam submissions
- The `config.js` credentials pattern exposes API keys in the browser; a backend proxy would be more secure for production

## Roadmap

- [ ] Add CAPTCHA (hCaptcha/reCAPTCHA) to prevent spam submissions
- [ ] Implement server-side validation via Supabase Edge Functions
- [ ] Add an admin dashboard to review, shortlist, and manage nominations
- [ ] Move credentials to environment variables with a backend proxy
- [ ] Add multi-language support (Hindi/Marathi alongside English)
- [ ] Implement nomination status tracking for nominators
- [ ] Add analytics and submission metrics dashboard

## Contributing

Contributions are welcome. Fork the repository, create a feature branch, and open a pull request against `main`.

> [!IMPORTANT]
> Test your changes locally with a static file server before opening a PR. Verify that form validation, file uploads, Supabase persistence, and EmailJS notifications all function correctly. Do not commit real API keys — use `config.example.js` values in your PR.

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

Distributed under the MIT License. See `LICENSE` for full terms.

<p align="center">
  <sub>Built with ♥ by <a href="https://github.com/Relvixx">Relvixx</a> · TEDxMET Nashik · 2026</sub>
</p>
