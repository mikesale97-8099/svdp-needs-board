# SVdP Parish Needs Board — Mockup

Two static pages, no build step required:

- `index.html` — the landing page a QR code on the physical bulletin flyer would point to
- `board.html` — the needs board itself (click "I can help" to see the claim interaction)

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
