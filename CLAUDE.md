# CLAUDE.md: Wang Huiwen's personal site

This is the personal portfolio site of **Wang Huiwen**: a Computing & Finance undergraduate at NTU in Singapore, aiming for a career in **finance**. Its audience is employers, recruiters, headhunters and HR, not developers. Judge every change by one question: does it make a good first impression on someone hiring in finance?

- Live site: https://www.huiwen.fyi (`huiwen.fyi` redirects to `www`)
- Mobile intro card: https://intro.huiwen.fyi
- Hosting: Vercel, deployed from the `v1` branch of `github.com/AlwaysTasty/astro-navfolio`
- The owner writes commits as "Kiryn". Commit only when asked.

## IGNORE these files: they are not for this site

The project is a fork of the **Navfolio** Astro template by dodolalorc.

- **`AGENT.md` and everything in `.agents/`** hold the template author's plans for refactoring Navfolio into a framework (`@navfolio/core`, plugins, RFCs, issue #68). They do not apply here. Don't read them for guidance or follow their workflows, and never start that refactor.
- **`src/docs/`** is a git submodule containing the template's demo and docs content, mostly in Chinese. The site does not use it; it's only used when `NAVFOLIO_CONTENT_SOURCE=docs`. Don't edit it.
- **Chinese comments** in `src/config/site.toml` and **Chinese font settings** (`zh`, ChillRoundM, LXGW) come from the template. The owner doesn't use Chinese typography. Leave the settings alone, but don't build anything around them.

## Stack and commands

- Astro 7 + MDX + Tailwind 4, with **bun** as runtime and package manager, Node >= 22.12.
- `bun run dev` starts the dev server on port 4321.
- `bunx astro build` builds the site **without** the font-subset step. Use this locally.
  - Full `bun run build` also runs `fonts:ui`, which needs Python `fonttools`. Vercel's install step provides it, so it may fail locally. That's expected.
- `bunx astro preview` serves `dist/`.
- Build warnings saying the `blog` and `vibe` collections are empty are **expected**. Both folders are empty on purpose.
- **Pre-commit hooks are deliberately turned off.** The owner removed the `"prepare": "husky"` script.
  - Don't re-add it.
  - Don't run `husky`.
  - Don't run repo-wide `prettier --write`. About 54 template files are unformatted, and reformatting them all would make template merges painful.
  - Format only the files you change: `bunx prettier --write <files>`.

## Where things live

| What | File |
|---|---|
| Almost all site copy: title, homepage intro, profile, top nav, homepage nav cards, social links, "Recently" list, page headings, theme, fonts | `src/config/site.toml` |
| Schema for that file (check it before adding a field) | `src/content.config.ts` |
| About page | `src/content/about.mdx` |
| Projects page intro | `src/content/projects/index.mdx` |
| One file per project (frontmatter: `title`, `description`, `date`, `tags`, `showHeroImage`, `comments`, `sidebar`) | `src/content/projects/*.md` |
| Blog posts (folder doesn't exist yet; create it; `bun run post:new` scaffolds one) | `src/content/blog/` |
| Résumé (linked from nav, homepage and card) | `public/Resume.pdf` |
| Avatar (still a dog photo; owner should replace it with a headshot) | `public/images/ndd_coke.jpg` |
| Homepage (also holds the mobile-redirect script) | `src/pages/index.astro` |
| Mobile intro card | `src/pages/card.astro` |
| Card content: name, headline, links (single source for the card and the vCard) | `src/data/card.ts` |
| "Save contact" vCard endpoint | `src/pages/contact.vcf.ts` |
| Shared layout (has a `head` slot for page-specific `<head>` content) | `src/layouts/BaseLayout.astro` |
| UI font: Inter via `@fontsource/inter`; code font is Monaco | `src/styles/fonts.css` |
| Build/install commands and the `intro.huiwen.fyi` redirect | `vercel.json` |

## How the mobile intro card works (don't break it)

1. **The NFC card / QR code** points to `https://intro.huiwen.fyi/?src=nfc` (or `?src=qr`). That URL is printed on a physical card, so it must keep working forever.
2. **`vercel.json` uses a `redirects` entry with a `host` condition** to send `intro.huiwen.fyi/` to `/card`. It must stay a redirect, not a rewrite: Vercel serves the existing `index.html` before applying rewrites, so a rewrite never runs. Keep `permanent: false`.
3. **On the main site**, an inline script in `index.astro` sends phone-width visitors (≤720px) to `/card` with `location.replace`. It only fires when:
   - the page is a real page load of `/`, not an in-site navigation (it checks the Navigation Timing entry, because the site uses Astro's `ClientRouter`);
   - the visitor hasn't opted out.
4. **Opting out:** the card's "Full website" button links to `https://www.huiwen.fyi/?full=1`. The homepage then sets `localStorage['skip-intro-card']` and strips the parameter from the URL.
   - The flag travels in the query string because `intro.` and `www.` are different origins and can't share localStorage.
   - That link opens in the same tab on purpose.
5. **The homepage** has a "Contact Card" nav card linking to `/card`.

If you change the card, test all three cases at phone width:

| Visitor | Expected result |
|---|---|
| Fresh visitor | Lands on the card |
| Tapped "Full website" | Stays on the main site from then on |
| Taps Home from inside the site | Stays on the homepage, no redirect |

Also test desktop, which should never redirect.

## Content rules: tone and accuracy

- **Tone:** professional, concise, first person. No jokes, memes, gaming or social links, "Larper"-style roles, or filler like "IDK what this is for".
  - A short, warm personal touch is fine (the Background section on About).
  - Personal details like housing or family finances are not.
- **Facts must come from the owner or `public/Resume.pdf`.** Never invent:
  - dates, metrics or returns
  - employers, responsibilities or tech stacks
  - trial phases or ticker details

  If something is missing, ask. Don't fill the gap with something plausible.
- **Performance claims:** the only approved one is **"+580% time-weighted return since Apr 2024 vs. the S&P 500"**, which matches the résumé. Don't reintroduce the old ">420% Jensen's alpha" line unless the owner provides support for it.
- **Investment content** (posts, pitches) must carry a "not investment advice / may hold positions" disclaimer. About already has one.
  - Remind the owner that a future bank employer's personal-trading and communications policies may restrict publicly naming tickers they trade.
- **Spelling:** British/Singapore English ("specialising"). Proofread everything, because typos cost credibility with this audience.
- **Keep it in sync:** when you change the owner's name, headline or links, update `site.toml`, `src/data/card.ts` and the résumé wording together.

## Current state (as of 2026-10-29)

**Done:**
- Professional copy across the site.
- Top nav is Home, Resume, Projects, About. Blog and Vibe are hidden because they're empty. A comment in `site.toml` shows how to re-add Blog.
- About page rewritten.
- Four projects written from the résumé: K-9 case logging app, distributed CV → ESP32 pipeline, ESP32 telemetry hardware, custom e-vehicle.
- Inter font.
- Mobile card, vCard and intro subdomain.
- 404 page cleaned up.
- `site.url` set correctly to `https://www.huiwen.fyi`.

## What's left (priority order)

1. **Confirm the project dates.** All four `date:` values are placeholders: `2026-07-01`, `2026-01-01`, `2026-01-01`, `2025-01-01`. Ask the owner for the real ones.
2. **Stock pitch / research write-ups.** These are the most valuable addition for finance recruiting. Each one is a blog post with:
   - the catalyst
   - trial success probability
   - an rNPV model (link a downloadable spreadsheet)
   - cash runway and dilution risk
   - what would prove the thesis wrong

   A post-mortem on a losing trade is also worth writing. When the first post is published, re-add Blog to `topNav` and to the homepage navigation cards.
3. **Project media:** photos or diagrams and GitHub links for each project. The `heroImage` frontmatter field exists, but `showHeroImage` is currently `false`.
4. **Headshot:** replace the dog avatar in `site.toml` (`profile.avatar`) and in `src/data/card.ts`.
5. **Evidence for the +580% claim:** an anonymised broker screenshot or a returns chart with the method stated. Otherwise, consider softening the claim.
6. **Optional finance-coding project:** a stock screener, backtester or clinical-trial catalyst tracker. It shows off the computing half of the degree in a finance setting.
7. **Optional cleanup**, only if the owner asks:
   - `.github/workflows/deploy-pages.yml` deploys to GitHub Pages on every push to `v1`. It's redundant with Vercel and may be failing.
   - `.github/workflows/deepseek-inline-review.yml` is template tooling.
   - The `vibe` module is still enabled in `navfolio.config.ts`, though unlinked.
   - The footer reads "Original Template by dodolalorc". Keep the credit.

## How to work in this repo

- Make the smallest change that does the job. Most content changes are a `site.toml` or Markdown edit, with no component changes.
- After any change, run `bunx astro build`. For visual changes, check the page in a browser at both phone width (375px) and desktop, in light and dark themes.
  - The site's own theme toggle uses `data-theme` on `<html>`.
- Don't upgrade dependencies, pull template updates, or touch `src/utils`, `src/plugins` or the `@navfolio/*` packages unless the owner asks.
- On Windows, git warnings about LF being replaced by CRLF are normal. Ignore them.
