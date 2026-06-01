# Agent Guidelines

## Project overview

Async Campaign is a React/TanStack Start application for managing tabletop-style campaigns. The frontend is deployed as a Cloudflare Worker, and persistent backend state lives in Convex.

## Tech stack

- **Package manager:** pnpm.
- **Runtime/build:** Vite + TanStack Start, React 19, TypeScript in strict mode.
- **Routing:** TanStack Router file-based routes in `src/routes`; `src/routeTree.gen.ts` is generated and should not be edited by hand.
- **Data fetching:** TanStack Query. Convex queries should generally be used through `@convex-dev/react-query` helpers such as `convexQuery`; mutations can use `useConvexMutation` with TanStack Query invalidation where needed.
- **Backend:** Convex functions, schema, and generated API under `convex/`.
- **Deployment:** Cloudflare Workers via `@cloudflare/vite-plugin` and `wrangler.jsonc`.
- **Styling:** Tailwind CSS v4, global CSS in `src/styles.css`.
- **Tooling:** Biome for linting/formatting, Vitest for tests.

## Common commands

```bash
pnpm dev       # start the Vite/TanStack Start dev server on port 3000
pnpm build     # production build
pnpm test      # run Vitest tests
pnpm lint      # Biome lint
pnpm format    # Biome format
pnpm check     # Biome lint + format checks
pnpm deploy    # build and deploy with Wrangler
```

Run `pnpm check` before handing off larger changes. Run `pnpm test` when behavior or data-flow logic changes.

## Component library and UI conventions

- This project uses **shadcn-style generated components** configured by `components.json` with the `base-nova` style, `neutral` base color, CSS variables, and **Lucide** icons.
- UI primitives live in `src/components/ui/` and are built mostly on **Base UI**, `class-variance-authority`, and Tailwind utility classes.
- Prefer existing `src/components/ui/*` components before adding custom markup or a new dependency.
- Use `~/lib/utils` `cn()` for class merging when composing Tailwind classes, especially with variant classes.
- Add reusable feature components under `src/components/<feature>/`; keep route files focused on routing, loading, and page composition.
- Preserve accessibility patterns from the UI primitives: labels, focus-visible states, keyboard support, ARIA props, and disabled states.
- The app currently defaults to dark mode at the document body; ensure new UI works well in dark mode.

## Code style

- TypeScript is strict (`noUnusedLocals`, `noUnusedParameters`, etc.); avoid `any` unless there is a documented reason.
- Use path alias `~/*` for `src/*` imports. The generated Convex API is currently imported via relative paths from routes/components.
- Prefer named functions/components for route components and reusable components.
- Keep components small and move repeated logic into hooks or helper modules.
- Use TanStack Router's `createFileRoute`/`createRootRouteWithContext` patterns for routes.
- Use route `loader`s to prefetch query data when a route depends on it, then consume with Suspense query hooks in the component.
- Do not edit generated files such as `src/routeTree.gen.ts` or Convex generated files in `convex/_generated/`.
- Biome is configured for double quotes in JavaScript/TypeScript and tabs for indentation; rely on `pnpm format` rather than manual formatting.

## Convex guidelines

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

Additional Convex conventions:

- Keep schema changes in `convex/schema.ts` and update related validators/functions together.
- Export Convex queries/mutations from focused files in `convex/` by domain (`campaigns`, `characters`, `messages`, etc.).
- Validate all Convex function arguments with `convex/values` validators.
- Keep authorization checks close to the Convex function that reads or writes protected data.
- Regenerate/check Convex types as needed when adding or renaming backend functions.

## Cloudflare/worker notes

- Worker configuration is in `wrangler.jsonc`; the entrypoint is `@tanstack/react-start/server-entry`.
- Avoid Node-only APIs in code that can run in the Cloudflare Worker runtime unless compatibility has been verified.
- Put production secrets in Wrangler secrets, not in committed files.

## Repository hygiene

- Do not commit `dist/`, local env files, or generated dependency directories.
- Keep new dependencies minimal; prefer existing stack libraries first.
- If adding a new library, document why it is needed and ensure it works in the Worker/browser environment used here.
