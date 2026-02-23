# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
deno task serve        # local dev server with hot reload
deno task build        # build to _site/
deno task lume cms     # start the Lume CMS
deno task update-deps  # update dependencies in plugins.ts and deno.json
deno lint              # lint (excludes _site/ and src/static/js/find-season.js)
deno fmt               # format (excludes _site/)
```

## Architecture

This is a personal website/blog built with [Lume](https://lume.land/) (v3.0.5) on Deno, using [Vento](https://vento.js.org/) (`.vto`) as the template engine. Source is in `src/`, output goes to `_site/`.

**Content**
- `src/posts/` — blog posts as Markdown. Required frontmatter: `title`, `date`, `draft`, `tags`, `author`. Posts are queried via `type=post`.
- `src/projects/` — project pages as Markdown. Required frontmatter: `title`, `year`, `draft`, `category[]`, `client`, `technologies[]`, `icon` (emoji codepoint), `description`, `link`.
- Posts support comments via optional `comments.src` (Mastodon URL) and `comments.bluesky` (Bluesky URL) frontmatter fields.
- Use `<!--more-->` in post body to set the excerpt boundary.

**Global data** (`src/_data.yml`)
- Site-wide metadata: `metas`, `lang`, `home`, `socials`, `sections`, `experience`, `education`.
- Changes here affect the homepage and navigation.

**Layouts** (`src/_includes/layouts/`)
- `base.vto` — HTML shell with navbar and scripts; all layouts extend this.
- `post.vto` — wraps Markdown posts; includes TOC (auto-generated), footnotes, comments, and prev/next pagination.
- `project.vto` — wraps project pages with metadata sidebar.

**Styling** (`src/_includes/css/`)
- `ds/variables.css` — all CSS custom properties for theming. Light mode defaults on `:root`, dark mode via `[data-theme="dark"]`. Edit here for color/font/spacing changes.
- `ds/` — design system tokens and component styles.
- Page-specific CSS files (e.g., `navbar.css`, `page.css`, `single-project.css`) live alongside the design system.
- CSS is processed via PostCSS.

**i18n** (`src/_data/i18n.yml`)
- All UI strings (nav labels, comment section text, reading time, etc.) are defined here.

**Plugins** (`plugins.ts`)
- Configures all Lume plugins: pagefind (search), feed (RSS/JSON at `/feed.xml` and `/feed.json`), sitemap, KaTeX, icons (Phosphor), inline, TOC, footnotes, image, reading info, date formatting, Mastodon comments.
- The feed queries `type=post` pages.
