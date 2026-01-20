# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Tooling and Commands

This is a TypeScript Next.js App Router project bootstrapped with `create-next-app` and primarily managed via `npm` scripts.

### Development server

- Start the Next.js dev server only (hot reload on port 3000):
  - `npm run dev`
- Start only the Inngest dev server (for background workflows):
  - `npm run inngest:dev`
- Start both Next.js and Inngest together via `mprocs` (requires `bun` installed, uses `mprocs.yaml`):
  - `npm run dev:all`

You can also use alternative package managers supported by `create-next-app` (e.g. `yarn dev`, `pnpm dev`, `bun dev`) if you prefer, but the canonical scripts in this repo assume `npm`.

### Build and production

- Build the app:
  - `npm run build`
- Start the production server (after building):
  - `npm run start`

### Linting

- Run ESLint using the project config in `eslint.config.mjs`:
  - `npm run lint`

### Database and Prisma

Prisma is configured with a PostgreSQL datasource and emits the client into `src/generated/prisma`.

- Ensure the Prisma client is generated (required before using `@/generated/prisma/client`):
  - `npx prisma generate`
- Apply schema changes with migrations (uses `prisma.config.ts` and `prisma/schema.prisma`):
  - `npx prisma migrate dev`

`DATABASE_URL` must be set in the environment for Prisma and the app to connect to the database.

### Tests

There is currently no test runner or `test` script defined in `package.json`, and the repository does not define any `*.test.*` or `*.spec.*` files. If you add a test runner (e.g. Jest or Vitest), also add a `test` script and document how to run a single test file or test case.

## High-Level Architecture

### Framework and entrypoints

- The app uses the Next.js **App Router** with source files under `src/app`.
- `src/app/layout.tsx` defines the root layout:
  - Sets up global fonts (Geist) and imports `src/app/globals.css` for Tailwind v4-based styling.
  - Wraps the entire app in `TRPCReactProvider` from `@/trpc/client` and mounts the `Toaster` from `@/components/ui/sonner` for global notifications.
- `src/app/page.tsx` is the authenticated home page. It calls `requireAuth` from `@/lib/auth-utils` on the server, and if the user is authenticated, renders `HomeClient`.

### Routing structure

- **Authenticated area**
  - `src/app/page.tsx` → protected by `requireAuth`, which checks the current session and redirects unauthenticated users to `/login`.
  - `src/app/HomeClient.tsx` is a client component that drives the main workflow view using tRPC and React Query.
- **Authentication area**
  - Uses a separate route group `src/app/(auth)`:
    - `src/app/(auth)/layout.tsx` wraps auth pages with `AuthLayout` from `@/features/auth/components/auth-layout` to provide a shared logo/centered card layout.
    - `src/app/(auth)/login/page.tsx` and `src/app/(auth)/register/page.tsx` call `requireUnAuth` to redirect authenticated users back to `/` and render the respective forms.
- **API routes** (Next.js Route Handlers):
  - `src/app/api/auth/[...all]/route.ts` exposes the Better Auth HTTP API via `toNextJsHandler(auth)`.
  - `src/app/api/trpc/[trpc]/route.ts` wires the tRPC router into `/api/trpc` using `fetchRequestHandler`.
  - `src/app/api/inngest/route.ts` exposes Inngest functions via `serve`.

### Authentication

Authentication is handled with **Better Auth** backed by Prisma.

- **Server-side auth configuration**
  - `src/lib/auth.ts` creates the `auth` instance via `betterAuth` with a Prisma adapter (`prismaAdapter(prisma, { provider: "postgresql" })`) using the shared Prisma client from `@/lib/db`.
  - Email/password auth is enabled with `autoSignIn: true`.
- **Auth utilities for routing**
  - `src/lib/auth-utils.ts` provides server helpers used in App Router components:
    - `requireAuth()`:
      - Calls `auth.api.getSession({ headers: await headers() })`.
      - Redirects to `/login` if there is no active session.
      - Returns the session object on success.
    - `requireUnAuth()`:
      - Uses the same session resolution and redirects **authenticated** users to `/`.
- **Client-side auth usage**
  - `src/lib/auth-client.ts` exports `authClient` created with `better-auth/react`.
  - `@/features/auth/components/login-form.tsx`:
    - Uses `authClient.signIn.email` with `email`, `password`, and `callbackURL`.
    - On success, navigates to `/`; on error, displays a `sonner` toast.
  - `@/features/auth/components/register-form.tsx`:
    - Uses `authClient.signUp.email` with `email`, `password`, and `callbackURL`.
    - On success, navigates to `/`; on error, displays a `sonner` toast.

### Database and Prisma layer

- **Schema definition**
  - `prisma/schema.prisma` defines:
    - Standard Better Auth entities: `User`, `Session`, `Account`, `Verification`.
    - A `Workflow` model with `id` and `name` fields, used by the main app.
  - `prisma.config.ts` defines the schema and migrations directory and reads `DATABASE_URL` from the environment.
  - The Prisma client is generated into `src/generated/prisma` and imported from there.
- **Client creation and reuse**
  - `src/lib/db.ts`:
    - Creates a `PrismaPg` adapter with `process.env.DATABASE_URL`.
    - Instantiates a `PrismaClient` with that adapter.
    - Caches the client on `global` in non-production to avoid creating multiple instances during hot reloads.
    - Exports the singleton Prisma client used throughout the app.

### tRPC and data fetching

The app uses **tRPC v11** together with **TanStack Query** for type-safe APIs.

- **tRPC server setup**
  - `src/trpc/init.ts`:
    - `createTRPCContext` (wrapped in `cache`) currently returns a simple context object (e.g. `{ userId: "user_123" }`).
    - Initializes tRPC via `initTRPC.create` and exports helpers:
      - `createTRPCRouter`, `createCallerFactory`, `baseProcedure`.
      - `protectedProcedure`, a middleware that:
        - Uses `auth.api.getSession` with `headers()` to validate the user.
        - Throws `TRPCError({ code: "UNAUTHORIZED" })` if there is no session.
        - On success, augments the context with `auth: session` and forwards to the next handler.
  - `src/trpc/routers/_app.ts`:
    - Exports the main `appRouter` with two protected procedures for the `Workflow` entity:
      - `getWorkflows`: `prisma.workflow.findMany()`.
      - `createWorkflow`: `prisma.workflow.create({ data: { name: "test" } })`.
    - Exports the `AppRouter` type.
  - `src/app/api/trpc/[trpc]/route.ts` hooks `appRouter` into the `/api/trpc` endpoint via `fetchRequestHandler`, using `createTRPCContext` for each request.
- **tRPC client and React Query integration**
  - `src/trpc/query-client.ts` defines `makeQueryClient()` with sensible defaults:
    - `staleTime` of 30 seconds.
    - Custom `dehydrate` behavior that also dehydrates pending queries.
  - `src/trpc/client.tsx` (client-only):
    - Uses `createTRPCContext<AppRouter>()` from `@trpc/tanstack-react-query` to create `TRPCProvider` and `useTRPC`.
    - Ensures a stable `QueryClient` instance both on server and client (with a `browserQueryClient` singleton on the client).
    - Computes the tRPC base URL, using the Vercel URL when available on the server and falling back to `http://localhost:3000`.
    - `TRPCReactProvider` wraps children with `QueryClientProvider` and `TRPCProvider`.
  - `src/trpc/server.tsx` (server-only):
    - Uses `makeQueryClient` and `cache` to expose a stable `getQueryClient` for server components.
    - Creates a `trpc` options proxy for server-side usage and a `caller` for programmatic server-side access to the router.
- **Usage in the UI**
  - `src/app/HomeClient.tsx`:
    - Uses `useTRPC()` together with TanStack Query hooks:
      - `useQuery(trpc.getWorkflows.queryOptions())` to load workflows.
      - `useMutation(trpc.createWorkflow.mutationOptions({ onSuccess: ... }))` to create workflows and invalidate the `getWorkflows` query on success.
    - Shows a simple JSON representation of the workflows and a button to create a new one.

### Inngest (background workflows)

- `src/inngest/client.ts` creates an `Inngest` client with id `nodebasen8n`.
- `src/inngest/functions.ts` defines an example function `helloWorld` that:
  - Listens to the event `test/hello.world`.
  - Sleeps for 1 second using `step.sleep`.
  - Returns a greeting using `event.data.email`.
- `src/app/api/inngest/route.ts` exposes Inngest functions to Next.js via `serve({ client: inngest, functions: [helloWorld] })` and provides `GET`, `POST`, and `PUT` handlers.

### Observability and Sentry

- **Global Sentry integration**
  - `next.config.ts` wraps the Next.js config with `withSentryConfig` from `@sentry/nextjs` to enable source map upload, a `/monitoring` tunnel route, and Vercel cron monitor instrumentation.
  - `src/instrumentation.ts` uses the App Router instrumentation hook `register()` to load either `sentry.server.config.ts` (for `NEXT_RUNTIME === "nodejs"`) or `sentry.edge.config.ts` (for `NEXT_RUNTIME === "edge"`) and exports `onRequestError` for unified request error capture.
- **Example diagnostics page**
  - `src/app/sentry-example-page/page.tsx` is a client-only page that verifies Sentry connectivity:
    - Calls `Sentry.diagnoseSdkConnectivity()` on mount to detect whether the SDK can reach Sentry and disables the button if not.
    - On button click, starts a span via `Sentry.startSpan`, calls `/api/sentry-example-api`, and then throws a `SentryExampleFrontendError` so you can see an example issue in Sentry.

### UI and styling

- Styling is implemented with **Tailwind CSS v4** using the PostCSS plugin configured in `postcss.config.mjs`.
- `src/app/globals.css`:
  - Imports Tailwind and `tw-animate-css`.
  - Defines theme tokens (colors, radii, shadows, typography) for light and dark modes using CSS custom properties and an `@theme inline` block.
  - Applies base styles such as `bg-background` and `text-foreground` and sets cursor behavior for buttons.
  - Includes a small rule for React Flow node selection styling.
- Reusable, Tailwind-based UI primitives live under `src/components/ui` (e.g. `button.tsx`, `card.tsx`, `form.tsx`, etc.) and are used across the auth forms and other parts of the app to maintain a consistent design system.

### Feature modules

- `src/features/auth` encapsulates the authentication UI:
  - `auth-layout.tsx` defines the shared layout used by all auth pages.
  - `login-form.tsx` and `register-form.tsx` implement the corresponding forms using `react-hook-form`, `zod`, and the shared UI primitives.
- Core application logic for workflows currently lives in the tRPC router (`src/trpc/routers/_app.ts`) and `HomeClient`. As the app grows, consider extracting domain-specific UI and logic into dedicated feature modules under `src/features`.
