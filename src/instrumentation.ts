import * as Sentry from "@sentry/nextjs";

/**
 * Load the Sentry configuration that matches the current Next.js runtime.
 *
 * When `NEXT_RUNTIME` is `"nodejs"` this imports the server configuration; when it is `"edge"` this imports the edge configuration.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;