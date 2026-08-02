# St. Luke SVdP Conference — Site Mockup

Three files, no build step required:

- `index.html` — the main content page (mission, needs preview, next drive, home visit results, campaigns, sister conferences, volunteer CTA) — this is what a QR code on a bulletin flyer should point to
- `board.html` — the dedicated, fully-interactive Needs Bulletin Board sub-page (filters + "I can help" claim interaction). Linked to from index.html's needs preview section.
- `site.js` — shared config and data-loading logic used by both pages (see "Google Sheet" section below)

## View it locally

Just open `index.html` in a browser, or run a tiny local server from this folder:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000


## Push to GitHub and turn on Pages

1. Create a new **empty** repository on GitHub (no README/license, so there's nothing to conflict with) — e.g. `svdp-needs-board`.
2. From this folder, run:

```
git init
git add .
git commit -m "Initial mockup: landing page + needs board"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/svdp-needs-board.git
git push -u origin main
```

3. On GitHub: go to the repo's **Settings → Pages**, and under "Build and deployment" set **Source: Deploy from a branch**, branch **main**, folder **/(root)**. Save.
4. GitHub will give you a live URL, usually `https://YOUR-USERNAME.github.io/svdp-needs-board/` — that's what the QR code on your flyer should point to.

## Notes / next steps

- The "40 Days for 40 Beds," "Volunteer," and "Give" links on the landing page are placeholders (`#`) — point them at real pages when ready.
- The needs board's claim state is in-memory only (resets on refresh) since this is a mockup — a real version would need a backend or a form (e.g. a Google Form) behind "I can help."

## Making the board and results table Google-Sheet-driven

Both `index.html`'s needs preview / results table and `board.html`'s full needs board pull from `site.js` — one place to update, both pages stay in sync.

### 1. Set up your sheet

Create one Google Sheet with two tabs:

**Tab "Needs"** — columns (exact header names, any order):
```
id | category | title | detail | urgency | active
```
- `category`: Furnishings, Rent, or Utilities (matches the filter buttons)
- `urgency`: high, medium, or low
- `active`: yes or no — set to "no" to pull a claimed/closed need off the board without deleting the row

**Tab "Results"** — columns:
```
month | home_visits | people_helped | furniture_requests | rent_utility_requests | financial_assistance
```
- One row per month. The site totals these automatically — no need for a manual Total row.

### 2. Publish each tab as CSV

For each tab:
1. File → Share → **Publish to web**
2. Under "Link," choose the specific tab (not "Entire Document")
3. Choose **Comma-separated values (.csv)** as the format
4. Click **Publish**, copy the URL it gives you

### 3. Paste the URLs into the site

Open `site.js`, find this block near the top:

```js
const NEEDS_CSV_URL = "";
const RESULTS_CSV_URL = "";
```

Paste your two published CSV URLs between the quotes, save, and re-upload `site.js` to GitHub (no need to touch `index.html` or `board.html`). Both pages will now update automatically whenever the sheet changes — no code edits needed for day-to-day updates.

If a URL is left blank or the fetch fails for any reason, the page quietly falls back to the built-in sample data, so it never shows a broken page.
