# Blindspot

Bug and feedback reporting tool for websites. End users capture screenshots and report issues directly from any site — developers receive rich GitHub issues with all context needed to fix bugs.

## Purpose

Make it seamless for **anyone** (not just developers) to report bugs on a website. Reports go straight to GitHub Issues where developers can triage them using Claude Code's GitHub MCP integration.

## How It Works

```
[End User on Website]
        ↓
    Clicks floating button → Screenshot + Annotate + Describe
        ↓
    Submit
        ↓
[Cloudflare Worker]
    - Receives report
    - Uploads screenshot to GitHub
    - Creates issue with metadata
        ↓
[GitHub Issue]
    - Screenshot attached
    - URL, browser, OS, console errors
    - User description
        ↓
[Developer in Claude Code]
    "Show me new bugs" → Claude fetches issues via GitHub MCP
    "Fix issue #42" → Claude sees screenshot, reads context, investigates
```

## Architecture

### 1. Widget (JavaScript embed)
- Site owner adds `<script>` tag to their website
- Floating button on side of page triggers capture
- Screenshot using html2canvas or similar
- Simple annotation tools (draw, highlight)
- Form: title + description
- Posts to Cloudflare Worker

### 2. Cloudflare Worker (API)
- Receives: screenshot (base64), metadata, description
- Stores GitHub token securely (environment variable)
- Uploads screenshot to GitHub repo (or issue attachment)
- Creates GitHub issue with formatted body
- Returns success/error to widget

### 3. GitHub Issues (Storage)
- Each bug = one issue
- Screenshot as image attachment
- Metadata in issue body (URL, browser, OS, screen size, console errors)
- Labels for triage (e.g., `blindspot`, `bug`)

## Auto-Captured Metadata

Collected automatically, no user input needed:
- Page URL
- Browser + version
- Operating system
- Screen size / viewport
- Console errors (recent)
- Timestamp

## Current Status: SaaS Platform ✓

**Implemented:**
- [x] Widget JS library (~37kb minified)
  - [x] Floating side button with "Report issue" text
  - [x] Screenshot capture via html2canvas
  - [x] Annotation tools: Element Picker, Arrow, Box, Text, Freeform
  - [x] Element picker captures rich data (selector, accessible name, context)
  - [x] Bug report form (title, description, submitted by)
  - [x] Submit to worker
- [x] Cloudflare Worker
  - [x] POST /report endpoint
  - [x] Upload screenshot to GitHub repo
  - [x] Create issue with labels and selected elements
  - [x] CORS support
- [x] SaaS API (`/api`)
  - [x] User authentication (GitHub OAuth)
  - [x] Site management (create, list sites)
  - [x] Per-site configuration
- [x] Website (`/website`)
  - [x] Landing page
  - [x] Dashboard for managing sites
- [x] Deployment
  - [x] Worker: `https://blindspot-worker.jasper-414.workers.dev`
  - [x] API: Cloudflare Workers
  - [x] Widget: Cloudflare R2 bucket
  - [x] Website: Cloudflare Pages (`getblindspot.pages.dev`)

**Not yet implemented:**
- Feature requests / general feedback
- Session replay
- Multiple project management integrations (Jira, Linear, etc.)

## Tech Stack

- **Widget:** Vanilla JS with esbuild bundling (~37kb)
- **Worker:** Cloudflare Workers
- **API:** Cloudflare Workers + D1 database
- **Storage:** GitHub Issues for bug reports
- **Screenshot:** html2canvas (loaded dynamically from CDN)
- **Hosting:** Cloudflare R2 (widget), Cloudflare Pages (website)

## Live URLs

- **GitHub Repo:** https://github.com/JasperNoBoxDev/blindspot
- **Website:** https://getblindspot.pages.dev
- **Worker:** https://blindspot-worker.jasper-414.workers.dev
- **Widget R2:** https://pub-566620c016dc4a40b7335d3f5e387a0e.r2.dev/blindspot.min.js

## Developer Experience

Site owner setup:
```html
<script src="https://pub-566620c016dc4a40b7335d3f5e387a0e.r2.dev/blindspot.min.js"></script>
<script>
  Blindspot.init({
    repo: 'YourOrg/your-repo',
    workerUrl: 'https://blindspot-worker.jasper-414.workers.dev'
  });
</script>
```

Developer triage (in Claude Code):
```
> list open issues labeled blindspot
> show me issue #42
> investigate and fix the bug in issue #42
```

## File Structure

```
blindspot/
├── widget/
│   ├── src/
│   │   ├── index.js        # Main entry, Blindspot.init()
│   │   ├── trigger.js      # Side tab button
│   │   ├── capture.js      # Screenshot via html2canvas + element map
│   │   ├── overlay.js      # Fullscreen overlay container
│   │   ├── toolbar.js      # Annotation tool buttons
│   │   ├── canvas.js       # Drawing canvas (arrow, box, text, freeform)
│   │   ├── sidebar.js      # Form panel
│   │   ├── metadata.js     # Auto-collect browser/OS/errors
│   │   ├── elements.js     # Element utilities
│   │   ├── elementPicker.js # Element picker tool
│   │   └── styles.js       # All CSS (injected)
│   ├── dist/
│   │   └── blindspot.min.js
│   ├── demo.html
│   └── package.json
├── worker/
│   ├── src/
│   │   └── index.js        # Bug report worker (GitHub issues)
│   ├── wrangler.toml
│   └── package.json
├── api/
│   ├── src/
│   │   └── index.js        # SaaS API (auth, sites)
│   ├── wrangler.toml
│   └── package.json
├── website/
│   ├── index.html          # Landing page
│   └── dashboard.html      # User dashboard
└── CLAUDE.md
```

## Key Implementation Details

### Widget
- **Trigger button:** Orange side tab, right edge, vertical "Report issue" text
- **Screenshot:** Captures `document.documentElement` with computed background color
- **Element picker:** Default tool, captures rich element data for AI debugging:
  - CSS selector path (unique)
  - Accessible name (aria-label, title, label)
  - Data attributes
  - Nearby landmarks/context
- **Canvas:** Sized to image's natural dimensions for proper annotation scaling
- **Annotations:** Purple (#9B78F4), stroke width 8, font size 24
- **Form fields:** Title (required), Description, Submitted by (required)

### Deployment
To update the widget for all users:
```bash
cd widget && npm run build
npx wrangler r2 object put blindspot-assets/blindspot.min.js \
  --file dist/blindspot.min.js --remote \
  --content-type "application/javascript" \
  --cache-control "public, max-age=300"
```

### Worker
- **Endpoint:** POST /report
- **Screenshot storage:** Uploaded to `.blindspot/screenshots/` in target repo
- **Issue format:** Description, reporter, screenshot image, environment table, console errors
- **Labels:** `blindspot`, `bug`

### Secrets
- Worker requires `GITHUB_TOKEN` secret (classic token with `repo` scope)
- Set via: `wrangler secret put GITHUB_TOKEN`

## Branding

Uses No Box Dev brand identity.

### Colors

| Name     | Hex       | Usage                    |
|----------|-----------|--------------------------|
| Charcoal | `#201E1D` | Primary text, backgrounds |
| Orange   | `#FE795D` | Primary accent, CTA       |
| Purple   | `#9B78F4` | Secondary accent          |
| White    | `#FFFFFF` | Light backgrounds, text   |

### Assets Location

Brand assets: `/Users/jaspermiddendorp/noboxdev/branding/No Box Dev x Maybe Design Studio/04 - FINAL ASSETS/`

- **Logo Mark:** Hexagon icon (use for widget button)
- **Favicons:** Circle and square variants
- **Graphics:** Hexagon patterns

### Widget Styling

- Floating button: Orange (`#FE795D`) with white hexagon icon
- Modal: White background, charcoal text
- Annotation tools: Purple (`#9B78F4`) for drawing
- Submit button: Orange (`#FE795D`)

## Notes

- Keep widget JS bundle small (<50kb)
- Widget must work on all modern browsers + mobile
- No user accounts required for reporters
- GitHub token never exposed to client
