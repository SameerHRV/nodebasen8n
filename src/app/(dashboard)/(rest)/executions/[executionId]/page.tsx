import { ExecutionsView } from "@/features/executions/execution";
import {
  ExecutionsError,
  ExecutionsLoding,
} from "@/features/executions/executions";
import { prefetchExecution } from "@/features/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface ExecutionIdProps {
  params: Promise<{
    executionId: string;
  }>;
}

const ExecutionId = async ({ params }: ExecutionIdProps) => {
  await requireAuth();

  const { executionId } = await params;
  prefetchExecution(executionId);
  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-3xl w-full flex flex-col gap-y-8 h-full">
        <HydrateClient>
          <ErrorBoundary fallback={<ExecutionsError />}>
            <Suspense fallback={<ExecutionsLoding />}>
              <ExecutionsView executionId={executionId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default ExecutionId;
