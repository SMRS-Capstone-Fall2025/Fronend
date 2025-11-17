# Driving Tutor (Vite + TypeScript + Tailwind)

A starter web app built with Vite, React, TypeScript and Tailwind CSS.

This README covers quick setup, development, build and useful scripts found in the repository.

## Contents

- Quick start
- Scripts
- Environment variables
- Tailwind & CSS
- Genkit (AI) helper scripts
- Linting & type checking
- Troubleshooting

## Quick start

Prerequisites

- Node.js 18+ (recommended)
- npm, pnpm or yarn (examples below use npm)

Install dependencies

```bash
npm install
# or pnpm install
# or yarn
```

Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser (Vite will print the exact URL).

## Useful scripts

These are the scripts from `package.json` and what they do:

- `npm run dev` — Run the Vite dev server
- `npm run build` — Run `tsc` then `vite build` to create a production build
- `npm run preview` — Locally preview the production build (after `build`)
- `npm run lint` — Run ESLint for TypeScript/TSX files (fails on warnings)
- `npm run typecheck` — Run `tsc --noEmit` to check types

Run any script with `npm run <script-name>` (or `pnpm`/`yarn` equivalents).

Run any script with `npm run <script-name>` (or `pnpm`/`yarn` equivalents).

## Environment variables

This project uses Vite. Client-side environment variables must be prefixed with `VITE_`.

Create a `.env` file at the project root (do not commit secrets).

Example `.env` (fill values for your services):

```env
# Vite will expose any variable that starts with VITE_ to client code
VITE_API_BASE_URL=https://api.example.com
VITE_FIREBASE_API_KEY=your_firebase_api_key

# Server-only secrets should NOT be prefixed with VITE_ and should only be used
# by server-side code. They will not be exposed to the browser.
```

The project includes `dotenv` as a dependency; Vite will also load `.env` files automatically in most setups.

## Tailwind CSS & PostCSS

Tailwind is configured in `tailwind.config.ts` and PostCSS in `postcss.config.mjs`.

Development

- The dev server (`npm run dev`) runs Vite's dev mode which supports Tailwind's JIT compiler — changes to classes update instantly.

Production build

- Running `npm run build` will produce optimized CSS as part of the Vite build pipeline.

Where to look

- Tailwind config: `tailwind.config.ts`
- Global CSS entry: `src/globals.css`

<!-- Genkit-related scripts and docs intentionally omitted -->

## Linting & Type Checking

- `npm run lint` — runs ESLint across the repo for `.ts` and `.tsx` files. The project config treats warnings as errors.
- `npm run typecheck` — runs TypeScript type checking without emitting files.

Tip: run both before creating a PR.

## Project structure (high level)

- `src/` — application source code
  - `app/` — route layout pages
  - `components/` — UI components and Radix + Tailwind UI pieces
  - `pages/` — static pages (for clarity; used by app routing)
  - `ai/` — Genkit AI helpers
  - `lib/` — utilities and types

## Development tips

- Use the React plugin for Vite (`@vitejs/plugin-react`) for fast HMR.
- If you change Tailwind config, restart the dev server to ensure proper purge scanning.
- Use `npm run lint` and `npm run typecheck` frequently.

## Troubleshooting

- Port conflicts: Vite will attempt to pick another port; check the terminal for the dev URL.
- CSS not updating: ensure `src/globals.css` imports Tailwind base/components/utilities and that the dev server is running.
- Environment variables not available in the browser: prefix with `VITE_`.

## Recommended VS Code extensions

- ESLint
- Tailwind CSS IntelliSense
- TypeScript and React (built-in)

## Contributing

1. Fork the repo and create a branch
2. Run tests / linters locally
3. Open a PR with a clear description

## License

This repository has no license file in the repo. Add a `LICENSE` file if you plan to open-source the project.

---

If you'd like, I can also:

- add a simple CONTRIBUTING.md
- add a `.env.example`
- wire up a GitHub Action for linting and type checks

Tell me which of those you'd like next.
