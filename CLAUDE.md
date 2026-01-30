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

## MVP Scope

**Focus: Bug reports only**

- [ ] Widget JS library
  - [ ] Floating button UI
  - [ ] Screenshot capture
  - [ ] Basic annotation (draw/highlight)
  - [ ] Bug report form
  - [ ] Submit to worker
- [ ] Cloudflare Worker
  - [ ] Receive reports
  - [ ] Upload image to GitHub
  - [ ] Create issue
- [ ] Configuration
  - [ ] Site owner specifies: GitHub repo, worker URL
  - [ ] Widget customization (position, colors)

**Not in MVP:**
- Feature requests / general feedback
- Session replay
- Multiple project management integrations
- User accounts / dashboard

## Tech Stack

- **Widget:** Vanilla JS (no framework, keep bundle small)
- **Worker:** Cloudflare Workers (free tier, globally distributed)
- **Storage:** GitHub Issues (no database needed)
- **Screenshot:** html2canvas or native browser APIs

## Developer Experience

Site owner setup:
```html
<script src="https://cdn.blindspot.dev/widget.js"></script>
<script>
  Blindspot.init({
    repo: 'owner/repo',
    workerUrl: 'https://blindspot-worker.username.workers.dev'
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
├── widget/           # JS widget for websites
│   ├── src/
│   └── dist/
├── worker/           # Cloudflare Worker
│   └── src/
└── docs/             # Setup guides
```

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
