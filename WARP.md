# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Tooling and Commands

This is a TypeScript Next.js App Router project. Runtime scripts are defined in `package.json` and can be invoked with `npm` (or `bun run`/`pnpm` if you prefer).

### Development

- Install dependencies:
  - `npm install`
- Start the Next.js dev server (App Router on port 3000):
  - `npm run dev`
- Start only the Inngest dev server (background workflow runner and dashboard):
  - `npm run inngest:dev`
- Start both Next.js and Inngest together via `mprocs` (see `mprocs.yaml`, requires `bun` installed for the Next.js process):
  - `npm run dev:all`

### Build and production

- Build the app:
  - `npm run build`
- Start the production server (after building):
  - `npm run start`

### Linting

- Run ESLint (configured via `eslint.config.mjs`):
  - `npm run lint`

### Database and Prisma

Prisma is configured with a PostgreSQL datasource and generates its client into `src/generated/prisma` (see `prisma/schema.prisma`).

- Generate / regenerate the Prisma client (required before using `@/generated/prisma/client`):
  - `npx prisma generate`
- Apply schema changes with migrations:
  - `npx prisma migrate dev --name <migration-name>`

`DATABASE_URL` must be set in the environment for Prisma and the app to connect to the database.

### Tests

There is currently no test runner or `test` script defined in `package.json`, and no `*.test.*`/`*.spec.*` files in the repo. If you introduce a test runner (e.g. Jest or Vitest), add the corresponding `test`/`test:watch` scripts to `package.json` and keep them documented here.

## High-Level Architecture

### Framework and entrypoints

- The app uses the Next.js **App Router** under `src/app` with TypeScript and Tailwind CSS v4.
- `src/app/layout.tsx` defines the root layout:
  - Sets up multiple Google fonts (`Inter`, `Space_Grotesk`, `Poppins`) and imports `src/app/globals.css`.
  - Wraps the tree with `TRPCReactProvider` (`@/trpc/client`), `NuqsAdapter` for URL search params, a global Jotai `Provider`, and the `Toaster` from `@/components/ui/sonner`.
- `next.config.ts` enables the React Compiler and configures a redirect from `/` to `/workflows` so the dashboard is the primary entrypoint once authenticated.

### Routing structure

- **Auth routes (`src/app/(auth)`)**
  - `src/app/(auth)/layout.tsx` wraps all auth pages in `AuthLayout` from `@/features/auth/components/auth-layout`.
  - `src/app/(auth)/login/page.tsx` and `src/app/(auth)/register/page.tsx` call `requireUnAuth()` and, if a session exists, redirect to `/workflows`; otherwise they render the respective forms.

- **Dashboard routes (`src/app/(dashboard)`)**
  - `src/app/(dashboard)/layout.tsx` composes the main app shell with `AppSidebar` (`@/components/web/app-sidebar`) and a `SidebarProvider` from `@/components/ui/sidebar`; `SidebarInset` hosts the active dashboard content.
  - `src/app/(dashboard)/(rest)/workflows/page.tsx` implements the workflows list at `/workflows`:
    - Calls `requireAuth()` to enforce authentication.
    - Uses `workflowParamsLoader` (`@/features/workflows/server/params-loader`) with `nuqs` to parse query params (page, search, etc.).
    - Calls `prefetchWorkflows` (`@/features/workflows/server/prefetch`) on the server, then renders `WorkflowsContainer` with a `HydrateClient` boundary so the client hooks can reuse prefetched data.
  - Other dashboard sections (e.g. `/credentials`, `/executions`, `/subscription`) live under `src/app/(dashboard)/(rest)/...` and follow the same pattern of wrapping feature modules that talk to tRPC and Prisma.

- **Visual editor routes (`src/app/(dashboard)/(editor)`)**
  - `src/app/(dashboard)/(editor)/workflows/[workflowId]/page.tsx` renders the React Flow–based editor for a single workflow:
    - Awaits `requireAuth()` and then `prefetchWorkflow(workflowId)`.
    - Wraps `EditorHeader` and the main `Editor` component from `@/features/editor/components/editor` in `HydrateClient`, `Suspense`, and a Sentry `ErrorBoundary`.

- **API routes (Next.js Route Handlers)**
  - `src/app/api/auth/[...all]/route.ts` exposes the Better Auth HTTP API.
  - `src/app/api/trpc/[trpc]/route.ts` mounts the tRPC router at `/api/trpc` using `fetchRequestHandler` and `createTRPCContext` from `@/trpc/init`.
  - `src/app/api/inngest/route.ts` exposes Inngest functions via `serve({ client: inngest, functions: [...] })`.
  - `src/app/api/sentry-example-api/route.ts` is used by the Sentry example page.

### Authentication and authorization

- **Server-side auth configuration**
  - `src/lib/auth.ts` configures Better Auth with the Prisma adapter backed by `@/lib/db` and integrates Polar via `@polar-sh/better-auth`:
    - On sign-up, a Polar customer is created.
    - Checkout and billing portal URLs are wired via the `checkout` and `portal` plugins (using `process.env.POLAR_SUCCESS_URL` and `POLAR_ACCESS_TOKEN`).

- **Routing helpers**
  - `src/lib/auth-utils.ts` defines:
    - `requireAuth()` – resolves the current session via `auth.api.getSession({ headers: await headers() })`; redirects to `/login` if unauthenticated.
    - `requireUnAuth()` – redirects authenticated users to `/workflows` to keep them out of the auth pages.

- **Client-side auth and billing state**
  - `src/lib/auth-client.ts` creates an `authClient` with the Polar plugin; this is consumed in UI and hooks.
  - `@/features/auth/components/login-form.tsx` and `register-form.tsx` call `authClient.signIn.email` / `authClient.signUp.email` and use `sonner` toasts for feedback.
  - `src/features/payments/hooks/use-payments.ts` and `useHasActivePayment()` query `authClient.customer.state()` via React Query to expose subscription state to the UI.

### Data model and Prisma layer

- `prisma/schema.prisma` defines:
  - Auth-related entities: `User`, `Session`, `Account`, `Verification` (mapped to `user`, `session`, `account`, `verification` tables) used by Better Auth.
  - Workflow automation domain models:
    - `Workflow` – owned by a `User`, with timestamps and relations to `Node` and `Connection`.
    - `Node` – graph node with `type: NodeType`, `position` JSON, `data` JSON, and relations to outgoing/ingoing `Connection`s.
    - `Connection` – directed edge from a `fromNode` to a `toNode` with `fromOutput`/`toInput` channels and a uniqueness constraint on each pair.
    - `NodeType` enum – currently `INITIAL`, `MANUAL_TRIGGER`, `HTTP_REQUEST`.
- `src/lib/db.ts` initializes a single shared `PrismaClient` using `PrismaPg` with `process.env.DATABASE_URL`, caching the instance on `global` in non-production to survive hot reloads.

### tRPC router and React Query integration

- **Core setup (`src/trpc`)**
  - `src/trpc/init.ts`:
    - Exposes `createTRPCRouter`, `createCallerFactory`, and a base `procedure` via `initTRPC.create({ transformer: superjson })`.
    - Defines `protectedProcedure` middleware that attaches `ctx.auth` based on Better Auth and throws `TRPCError("UNAUTHORIZED")` when there is no session.
    - Defines `premiumProcedure` which wraps `protectedProcedure` and uses `polarClient.customers.getStateExternal({ externalId: ctx.auth.user.id })` to enforce an active Polar subscription, attaching `ctx.customer` when present and throwing `TRPCError("FORBIDDEN")` otherwise.
  - `src/trpc/routers/_app.ts` creates the root `appRouter` with a single namespaced router:
    - `workflows: workflowsRoute` from `@/features/workflows/server/routers`.
  - `src/trpc/server.tsx` exposes a server-only `trpc` options proxy, a `caller` for programmatic access, `prefetch()` helpers, and `HydrateClient` to dehydrate/rehydrate React Query state across the server/client boundary.
  - `src/trpc/client.tsx` wires up the browser/client side:
    - Creates a single `QueryClient` instance (per request on the server, singleton on the client).
    - Uses `createTRPCClient` + `httpBatchLink` with `superjson` to call `/api/trpc`.
    - `TRPCReactProvider` wraps the React tree with `QueryClientProvider` and `TRPCProvider`; `useTRPC()` is used in client components.

- **Workflow router (`src/features/workflows/server/routers.ts`)**
  - `workflowsRoute` contains the main domain APIs under `trpc.workflows.*`:
    - `getMany` (protected) – paginated, searchable list of workflows for the current user using constants from `@/config/constants`.
    - `getOne` (protected) – loads a single workflow including `nodes` and `connections`, then maps them into XYFlow-compatible `Node[]` and `Edge[]` structures consumed by the editor.
    - `create` (premium) – creates a new workflow for the current user with an initial `NodeType.INITIAL` node and a generated slug name via `random-word-slugs`.
    - `updateName` (protected) – updates the workflow name.
    - `remove` (protected) – deletes a workflow scoped to the current user.
    - `update` (protected) – replaces all nodes and connections for a workflow inside a Prisma transaction, derived from the XYFlow `nodes`/`edges` passed from the client; also bumps `updatedAt`.
    - `execute` (protected) – sanity-checks ownership and then emits an Inngest event `workflow/execute.workflow` with the workflow id.

- **Client hooks (`src/features/workflows/hooks/use-workflows.ts`)**
  - Provide React Query hooks over `trpc.workflows.*`:
    - `useSuspenseWorkflows()` – paginated list based on URL params.
    - `useCreateWorkflow()`, `useRemoveWorkflow()`, `useUpdateWorkflowName()`, `useUpdateWorkflow()`, `useExecuteWorkflow()` – mutations that show `sonner` toasts and invalidate the appropriate queries.

### Workflow list and visual editor

- **List view (`src/features/workflows/components/workflows.tsx`)**
  - Composes a generic entity UI (search, list, pagination) using `Entity*` components from `@/components/web/entity-components`.
  - Uses `nuqs` + `useWorkflowsParams()` to keep pagination/search state in the URL.
  - Renders `WorkflowItem` rows that link to `/workflows/[workflowId]`, with delete actions wired to `useRemoveWorkflow()`.

- **Editor (`src/features/editor/components/editor.tsx`)**
  - Client-only React Flow canvas that consumes `useSuspenseWorkflow(workflowId)` to hydrate initial `nodes`/`edges`.
  - Manages local graph state with `useState` and XYFlow utilities `applyNodeChanges`, `applyEdgeChanges`, and `addEdge`.
  - Registers custom node components from `@/config/node-components` (e.g. for manual triggers and HTTP requests).
  - Stores the React Flow instance in a Jotai atom (`editorAtom`) for use by other components.
  - Detects whether the graph contains any `NodeType.MANUAL_TRIGGER` nodes to conditionally render an `ExecuteWorkflowButton` overlay; this button uses `useExecuteWorkflow()` to trigger execution via tRPC/Inngest.

### Workflow execution engine (Inngest + executors)

- `src/inngest/client.ts` configures a single Inngest client for the app.
- `src/inngest/utils.ts` exposes `TopologicalSort`, which orders nodes based on `Connection`s so the workflow can be executed in dependency order.
- `src/inngest/functions.ts` defines the `executeWorkflow` Inngest function:
  - Trigger: `workflow/execute.workflow` events with `workflowId` (and optional `initialData`).
  - Step "prepare-workflow": loads the workflow (with `nodes` and `connections`) from Prisma and topologically sorts the graph.
  - Iterates through sorted nodes, looks up a node executor via `getExecutor(node.type)` from `@/features/executions/libs/executor-registory`, and threads a mutable `context` object through each node.
  - Throws a `NonRetriableError` if the workflow id is missing or an executor is not registered.

- `src/features/executions/libs/executor-registory.ts` maps `NodeType` values to concrete executors:
  - `INITIAL` and `MANUAL_TRIGGER` share the `manualTriggerExecutor` from `@/features/triggers/components/manual-triggers/executor`.
  - `HTTP_REQUEST` uses `httpRequestExecutor` from `@/features/executions/components/http-request/executor`.

### Observability and Sentry

- `next.config.ts` wraps the Next configuration with `withSentryConfig`, enabling source map upload, a `/monitoring` tunnel route, and automatic Vercel Cron monitors.
- `src/instrumentation.ts` uses the App Router `register()` hook to load `sentry.server.config.ts` or `sentry.edge.config.ts` depending on `NEXT_RUNTIME` and re-exports `onRequestError` from Sentry.
- `sentry.server.config.ts` and `sentry.edge.config.ts` initialize Sentry for Node and Edge runtimes respectively (DSN, tracing, console logging, and PII options are configured there).
- `src/app/sentry-example-page/page.tsx` plus `src/app/api/sentry-example-api/route.ts` form an end-to-end diagnostics flow that verifies Sentry connectivity from the browser through the API.

### UI and styling

- Styling is implemented with **Tailwind CSS v4** using `@tailwindcss/postcss` (see `postcss.config.mjs`).
- `src/app/globals.css`:
  - Imports Tailwind and `tw-animate-css` utilities.
  - Declares design tokens (colors, radii, typography, etc.) via CSS variables and an `@theme inline` block for both light and dark themes.
  - Applies global base styles (e.g. background/foreground colors) and includes tweaks for XYFlow node selection.
- Shared UI primitives (buttons, cards, forms, etc.) live under `src/components/ui` and are used across auth, workflows, editor, and dashboard components.
- Higher-level web UI shells such as `AppSidebar` and generic entity list building blocks live under `src/components/web`.

### Feature modules overview

- `src/features/auth` – authentication views and layout using Better Auth on the client side.
- `src/features/workflows` – workflow listing, URL-driven filters, server-side prefetching, and tRPC hooks.
- `src/features/editor` – React Flow–based workflow editor and editor-specific state.
- `src/features/triggers` – node implementations for trigger-type nodes (e.g. manual triggers).
- `src/features/executions` – node implementations and helpers for execution-type nodes (e.g. HTTP request executor registry).
- `src/features/payments` – hooks for reading Polar subscription state via `authClient`.

When adding new domain areas, prefer following this feature-module pattern: colocate UI, hooks, server routers, and Inngest integrations under `src/features/<domain>` and register new tRPC routers in `src/trpc/routers/_app.ts`.
