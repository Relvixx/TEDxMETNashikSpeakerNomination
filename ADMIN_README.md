# TEDxMET Nashik — Admin Dashboard

> **Internal documentation for the speaker nomination review dashboard.**
> This file is for the organizing team only. Do not share publicly.

---

## Table of Contents

1. [Pre-Deployment Setup](#1-pre-deployment-setup)
2. [User Guide](#2-user-guide)
3. [Code Reference](#3-code-reference)
4. [Security Notes & Post-Event Checklist](#4-security-notes--post-event-checklist)

---

## 1. Pre-Deployment Setup

**Estimated time: 10 minutes**

Follow these steps exactly. All SQL runs in the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).

### Step 1 — Add new columns to the `nominations` table

Open your Supabase project → SQL Editor → New Query. Paste and run:

```sql
ALTER TABLE nominations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE nominations ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE nominations ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
```

These columns let the dashboard track review status, internal team notes, and when each nomination was last reviewed.

### Step 2 — Set up Row Level Security (RLS) policies

In the same SQL Editor, paste and run:

```sql
-- Enable RLS on the nominations table
ALTER TABLE nominations ENABLE ROW LEVEL SECURITY;

-- Policy: Public users can submit nominations (INSERT only)
CREATE POLICY "anon_insert" ON nominations
  FOR INSERT TO anon WITH CHECK (true);

-- Policy: Authenticated users can read all nominations (dashboard)
CREATE POLICY "auth_select" ON nominations
  FOR SELECT TO authenticated USING (true);

-- Policy: Authenticated users can update status and notes (dashboard actions)
CREATE POLICY "auth_update" ON nominations
  FOR UPDATE TO authenticated USING (true);
```

> **Note:** If you already have RLS enabled or existing policies, check for conflicts first. You can view existing policies in Supabase → Authentication → Policies.

### Step 3 — Generate your admin password hash

1. Open any modern browser (Chrome, Edge, Firefox)
2. Open DevTools → Console (press `F12` or `Ctrl+Shift+J`)
3. Run this one-liner, replacing `YOUR_PASSWORD` with your chosen password:

```js
crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR_PASSWORD'))
  .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
```

4. The console will print a 64-character hex string. Copy it.

**Example:**
- Password: `tedx2026admin`
- Hash output: `a1b2c3d4...` (64 chars — this is not the real hash, just an example)

### Step 4 — Add the hash to `config.js`

Open `config.js` and replace `'YOUR_SHA256_HASH_HERE'` with the hash you just generated:

```js
window.CONFIG = {
  SUPABASE_URL: 'https://hubxctffnforizfayfzv.supabase.co',
  SUPABASE_ANON: '...',
  EMAILJS_PUBLIC_KEY: '...',
  EMAILJS_SERVICE_ID: '...',
  EMAILJS_TEMPLATE_ADMIN: '...',
  EMAILJS_TEMPLATE_USER: '...',
  ADMIN_PASSWORD_HASH: 'paste_your_64_char_hash_here'  // ← HERE
};
```

### Step 5 — Verify `robots.txt`

Ensure `robots.txt` exists in the project root with this content:

```
User-agent: *
Allow: /
Disallow: /admin.html
```

This tells search engines not to index the admin page.

### Step 6 — Deploy

Push to your repository. Vercel will automatically deploy. No other configuration needed.

- The admin page is available at: `https://your-domain.in/admin.html`
- No links to it exist on the public site — access is by direct URL only

---

## 2. User Guide

*Written for the TEDxMET Nashik team lead and reviewers.*

### Accessing the Dashboard

Open your browser and go to `YOUR_DOMAIN/admin.html`. There are no links to this page on the main website — you need to type the URL directly.

### Logging In

Enter the admin password and click **Authenticate**. The password is shared privately by the tech lead.

- If you enter the wrong password, you'll see how many attempts you have left.
- After 5 wrong attempts, the login locks for 15 minutes. Wait it out — there's a countdown timer.
- If you forget the password, contact Rahul (the developer). He can generate a new one.

Once logged in, you stay logged in for 8 hours or until you close the browser tab.

### Understanding the Stats Cards

At the top of the dashboard, you'll see seven cards:

| Card | What it shows |
|------|---------------|
| **Total Nominations** | Every nomination ever submitted (highlighted in red) |
| **Today** | Nominations received today |
| **Shortlisted** | Nominations you've marked as "Shortlisted" |
| **With Documents** | Nominations that include uploaded files (PDFs, videos, etc.) |
| **Submissions Trend** | A bar chart showing daily submissions over the last 14 days |
| **Pending Review** | Nominations that haven't been reviewed yet — these need your attention |
| **Deadline** | The nomination deadline date (July 20) and how many days are left |

### Filtering Nominations

Above the table, you'll see filter tabs:

- **All** — Shows everything
- **Pending** — Not yet reviewed
- **Under Review** — Being considered
- **Shortlisted** — Made the cut
- **Rejected** — Not selected

Click any tab to filter. The active tab turns red.

### Searching

Type in the search box to find nominations by nominator name, speaker name, or email. Results update instantly as you type.

### Viewing Nomination Details

Click any row in the table. A panel slides in from the right showing all the details:

- Speaker name and LinkedIn profile
- The full core idea and justification
- Who submitted the nomination and their contact info
- Any uploaded files
- Space for your internal notes

Click the **✕** button or the dark area to the left to close the panel.

### Changing a Nomination's Status

In the detail panel, you'll see four status buttons:

- **Pending** — Default state. Hasn't been looked at.
- **Under Review** — You're currently evaluating this nomination.
- **Shortlisted** — This speaker is being seriously considered for the event.
- **Rejected** — This nomination won't move forward.

Click any button to change the status. It saves automatically and updates everywhere instantly.

### Viewing Attached Files

If a nomination has uploaded files, you'll see them listed in the detail panel. Click any filename to open it in a new tab. Files are accessed securely through temporary links that expire after 1 hour.

### Adding Internal Notes

At the bottom of the detail panel, there's a text area for internal notes. Type your thoughts — they save automatically when you click away. You'll see a green "Saved ✓" confirmation.

These notes are only visible in the dashboard. Nominators never see them.

### Exporting to Excel

Click **Export CSV** (in the top navigation bar or above the table) to download the current list as a `.csv` file. This file opens directly in Microsoft Excel or Google Sheets.

The export includes only what's currently shown — so if you're filtering by "Shortlisted", only shortlisted nominations are exported.

### The "Live" Indicator

The pulsing red dot labeled **LIVE** in the top navigation means the dashboard automatically updates when new nominations come in. You'll see:

- A notification toast in the bottom-right corner
- The new nomination added to the top of the table
- Stats numbers updated

No need to refresh the page.

### Logging Out

Click **Logout** in the top-right corner. You'll be taken back to the login screen.

---

## 3. Code Reference

*Technical documentation for Rahul (developer/maintainer).*

### Architecture Overview

The admin dashboard is a single self-contained HTML file (`admin.html`) with all CSS in a `<style>` block and all JS in a `<script>` block inside an IIFE. External dependencies are two CDN scripts: `@supabase/supabase-js@2` and `chart.js@4`.

Runtime configuration is loaded from `config.js` via `window.CONFIG`, the same file used by the public nomination form.

### Function Reference

All functions live inside the IIFE in `admin.html`. Here's every function:

| Function | Purpose | Parameters |
|----------|---------|------------|
| `formatDate(ts)` | Formats ISO timestamp to `"28 Jul 2026"` | `ts`: ISO string |
| `formatDateTime(ts)` | Formats to `"28 Jul 2026, 07:30 PM"` | `ts`: ISO string |
| `truncate(text, max)` | Truncates text with ellipsis | `text`: string, `max`: number |
| `escapeHtml(str)` | Prevents XSS by escaping HTML entities | `str`: raw string |
| `sha256(message)` | Computes SHA-256 hash via Web Crypto API | `message`: plain text. Returns `Promise<string>` (hex) |
| `animateCounter(el, start, end, duration)` | Animates a number counter with ease-out cubic | `el`: HTMLElement, `start`/`end`: numbers, `duration`: ms |
| `showToast(type, title, message)` | Shows a bottom-right toast notification | `type`: `'success'`\|`'error'`, `title`: string, `message`: string |
| `getStatusBadgeHtml(status)` | Returns HTML for a status pill badge | `status`: status key string |
| `countFiles(fileNames)` | Counts comma-separated filenames | `fileNames`: string |
| `hasValidSession()` | Checks sessionStorage for valid, non-expired session | — |
| `createSession()` | Stores new session in sessionStorage | — |
| `destroySession()` | Clears session, unsubscribes Realtime, resets state | — |
| `getLockout()` | Reads lockout state from localStorage | — |
| `saveLockout(state)` | Writes lockout state to localStorage | `state`: `{attempts, lockedUntil}` |
| `isLockedOut()` | Checks if brute-force lockout is active | — |
| `initLogin()` | Initializes login screen, binds form events | — |
| `updateLockoutUI()` | Updates lockout countdown timer display | — |
| `initDashboard()` | Main dashboard initializer: Supabase init, data fetch, render, Realtime subscribe | — |
| `renderError(message)` | Renders error card with retry button | `message`: string |
| `renderDashboardUI()` | Renders full dashboard: stats, filters, table | — |
| `renderSparkline()` | Creates/updates Chart.js bar sparkline (14-day trend) | — |
| `applyFiltersAndRender()` | Applies filter/search/sort to `allNominations`, updates `filteredNominations`, re-renders table | — |
| `updateSortIndicators()` | Updates ↑/↓ indicators in table headers | — |
| `renderTable()` | Renders table rows for current page from `filteredNominations` | — |
| `openPanel(id)` | Opens detail panel for a nomination | `id`: UUID string |
| `closePanel()` | Closes detail panel, clears selection | — |
| `renderDocsList(nom)` | Returns HTML for file links in detail panel | `nom`: nomination object |
| `openSignedUrl(path, linkEl)` | Generates signed URL and opens in new tab | `path`: storage path, `linkEl`: HTMLElement |
| `updateStatus(id, newStatus)` | Updates status in Supabase + local data (optimistic) | `id`: UUID, `newStatus`: status key |
| `refreshPanelStatus(status)` | Updates status badge + buttons in open panel | `status`: status key |
| `saveNotes(id, notes)` | Auto-saves notes to Supabase on blur | `id`: UUID, `notes`: text |
| `updateStatCounters()` | Recalculates and sets all stat card numbers | — |
| `subscribeRealtime()` | Sets up Supabase Realtime channel for INSERT events | — |
| `exportCSV(nominations)` | Exports array of nominations as downloadable CSV | `nominations`: array |
| `init()` | Entry point: checks session, routes to login or dashboard | — |

### Storage Keys

**Session** — `sessionStorage` key: `tedx_admin_session`
```json
{
  "authenticated": true,
  "loginTime": 1722177600000,
  "expires": 1722206400000
}
```
- Expires after 8 hours from login
- Cleared on logout or tab close (sessionStorage behavior)

**Lockout** — `localStorage` key: `tedx_admin_lockout`
```json
{
  "attempts": 3,
  "lockedUntil": 0
}
```
- `attempts`: incremented on each failed login
- `lockedUntil`: Unix timestamp when lockout expires (set after 5 failures)
- Persists across tabs and browser restarts

### How to Change the Admin Password

1. Choose a new password
2. Open browser console and run:
   ```js
   crypto.subtle.digest('SHA-256', new TextEncoder().encode('NEW_PASSWORD_HERE'))
     .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
   ```
3. Copy the 64-character hex output
4. Open `config.js` and replace the `ADMIN_PASSWORD_HASH` value
5. Redeploy (push to repo → Vercel auto-deploys)
6. Existing sessions remain valid until they expire (8 hours max)

### How to Disable Realtime

If you don't need live updates (e.g., after the event), comment out the Realtime subscription call in `admin.html`:

```js
// In the initDashboard() function, find and comment out:
// subscribeRealtime();
```

This prevents the dashboard from maintaining a persistent WebSocket connection to Supabase.

### How to Add a New Column to the Dashboard

1. Add the column in Supabase SQL Editor:
   ```sql
   ALTER TABLE nominations ADD COLUMN IF NOT EXISTS your_column TEXT;
   ```
2. In `admin.html`, update the table header in `renderDashboardUI()` — add a new `<th>`
3. Update the table body in `renderTable()` — add a new `<td>` in the row template
4. If you want it in the detail panel, add a new section in `openPanel()`
5. If you want it in CSV export, add it to the `headers` and `rows` arrays in `exportCSV()`

---

## 4. Security Notes & Post-Event Checklist

### Client-Side Auth — Honest Assessment

The admin dashboard uses **client-side password verification** (SHA-256 hash comparison in the browser). This is **not** equivalent to server-side authentication. Here's why it's acceptable for this use case:

- **The password protects the UI, not the data.** Supabase Row Level Security (RLS) is the real access control layer. Without valid Supabase credentials, no one can read or modify nomination data regardless of the dashboard.
- **The threat model is low.** This is an internal tool for a college TEDx event with ~5 reviewers, not a banking application.
- **The hash never reveals the password.** SHA-256 is a one-way function. Even if someone reads `config.js`, they'd need to brute-force the hash.
- **The dashboard uses the `anon` key.** This key is already public (embedded in the public nomination form). The dashboard doesn't use any elevated Supabase credentials.

**What a determined attacker could do:** Open the browser's Developer Tools, find the Supabase anon key in `config.js`, and use it to query the `nominations` table directly. RLS policies would need to account for this. The current policies allow `SELECT` for `authenticated` role only — the `anon` role can only `INSERT`.

### Why Supabase RLS Is the Real Security Layer

Row Level Security policies are enforced server-side by PostgreSQL. They cannot be bypassed from the client. The policies we set up ensure:

- **Anonymous users** (public website visitors) can only INSERT new nominations
- **Authenticated users** can SELECT and UPDATE nominations
- No role can DELETE nominations

### Password Best Practices

- **Never share the password** over WhatsApp, SMS, or unencrypted email
- Use a secure channel: in-person, encrypted messaging (Signal), or a password manager's sharing feature
- Choose a strong password: 12+ characters, mix of letters/numbers/symbols

### If the Password Is Compromised

1. Immediately generate a new SHA-256 hash (see Step 3 in Setup)
2. Update `ADMIN_PASSWORD_HASH` in `config.js`
3. Redeploy the site
4. Inform all reviewers of the new password via a secure channel
5. Existing sessions will still work until they expire — to force everyone out, change the `SESSION_KEY` constant in `admin.html`

### Post-Event Checklist (After July 20)

- [ ] **Rotate the password hash** — Generate a new hash and update `config.js`
- [ ] **Add a "Nominations Closed" notice** — Optionally, update the dashboard's deadline card or add a banner
- [ ] **Disable Realtime** — Comment out `subscribeRealtime()` in `initDashboard()` to stop the WebSocket connection
- [ ] **Consider read-only mode** — Remove or restrict the `auth_update` RLS policy if no more status changes are needed:
  ```sql
  DROP POLICY "auth_update" ON nominations;
  ```
- [ ] **Export final data** — Use the CSV export to create a complete backup of all nominations with statuses and notes
- [ ] **Archive** — Consider backing up the Supabase database before any cleanup

---

*Last updated: July 2026*
*Maintainer: Rahul*
