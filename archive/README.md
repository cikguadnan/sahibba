# Sahibba Legacy Archive

This folder documents code that is no longer part of the GitHub Pages production application.

## Recovery point

Before repository cleanup, the complete mixed static + Next/Vinext tree was available at commit:

`633831c528f07aa8f4d3690bed67281e1a015711`

Git history is the canonical archive. Any legacy file can be recovered from that commit without restoring it to the production path.

## Legacy / non-production areas

The following are not used by the current GitHub Pages runtime:

- `app/chatgpt-auth.ts`
- `app/firebase.ts`
- `app/game-portal.tsx`
- `app/layout.tsx`
- `app/live-game.ts`
- `app/page.tsx`
- `app/teacher/**`
- `build/**`
- `db/**`
- `drizzle/**`
- `examples/**`
- `worker/**`
- `next.config.ts`
- `vite.config.ts`
- `drizzle.config.ts`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `tsconfig.json`
- `package.json`
- `package-lock.json`
- `.env.example`
- `.npmrc`
- `.openai/**`
- old framework-oriented scripts under `scripts/**`
- old framework-oriented test under `tests/rendered-html.test.mjs`

These files are intentionally treated as archived legacy code rather than production source. They remain recoverable through Git history while the live app continues to use the static Firebase implementation.

## Current production files

The live application depends on:

- `index.html`
- `app/globals.css`
- `site.js`
- `dashboard.css`
- `teacher-refresh.css`
- `teacher-refresh.js`
- `kamus-47000.js`
- `firebase-config.js`
- `live.html`
- `live.js`
- `live.css`
- `firestore.rules`
- `firebase.json`
- `public/favicon.svg`

Do not build new features in the legacy Next/Vinext prototype unless a deliberate migration back to that architecture is planned.
