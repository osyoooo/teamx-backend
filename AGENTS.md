# Repository Guidelines

## Project Structure & Module Organization
- `src/app` or `src/pages`: Next.js routes (App or Pages Router).
- `src/components`: Reusable UI components; colocate styles/tests when helpful.
- `src/lib` or `src/utils`: Pure logic, helpers, API clients.
- `public/`: Static assets served at site root.
- `styles/`: Global styles, tokens, and resets.
- `tests/` or `__tests__/`: Centralized tests; alternativly `*.test.ts(x)` colocated.

## Build, Test, and Development Commands
- `npm i` (or `pnpm i`): Install dependencies.
- `npm run dev`: Start local dev server with HMR.
- `npm run build`: Production build (type-checks when configured).
- `npm start`: Run the production build locally.
- `npm test` / `npm run test:watch`: Run unit tests (watch mode if available).
- `npm run lint` / `npm run format`: Lint and auto-format the codebase.

Use the package manager implied by the lockfile (`pnpm-lock.yaml`, `yarn.lock`, or `package-lock.json`).

## Coding Style & Naming Conventions
- TypeScript-first; prefer `.tsx` for React components.
- 2-space indentation; single-responsibility modules and small components.
- File names: `kebab-case` for files, `PascalCase` for React components, `camelCase` for variables.
- Enforced by ESLint and Prettier; run `npm run lint` and `npm run format` before pushing.

## Testing Guidelines
- Framework: Jest or Vitest (see `package.json` scripts).
- Test files: `*.test.ts`/`*.test.tsx` mirroring the source structure.
- Aim for meaningful coverage on business logic and critical UI states.
- Run `npm test` locally; prefer deterministic, DOM-light tests for components.

## Commit & Pull Request Guidelines
- Conventional Commits: `feat(ui): add Button loading state`.
- Keep commits focused and logically grouped; include tests when changing behavior.
- PRs: clear description, rationale, linked issue, screenshots for UI, and checklist of impacts (routes, env, migrations).
- Ensure CI passes: build, lint, and tests must be green.

## Security & Configuration Tips
- Environment variables: use `.env.local` for development; never commit secrets.
- Client-exposed vars must start with `NEXT_PUBLIC_`.
- Validate external inputs and guard network calls in server components/routes.
