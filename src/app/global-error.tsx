"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

/**
 * Client-side error boundary that reports the given error to Sentry and renders Next.js's default error page.
 *
 * @param error - The thrown error to report and display. May include an optional `digest` string produced by Next.js.
 * @returns A minimal HTML document that renders Next.js's default error UI. The component passes `statusCode={0}` to show a generic error message because the App Router does not expose HTTP status codes for errors.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}