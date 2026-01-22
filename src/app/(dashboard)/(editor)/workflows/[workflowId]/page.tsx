import {
  Editor,
  EditorError,
  EditorLoding,
} from "@/features/editor/components/editor";
import EditorHeader from "@/features/editor/components/editor-header";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "@sentry/nextjs";
import { Suspense } from "react";

interface WorkflowIdProps {
  params: Promise<{
    workflowId: string;
  }>;
}

const WorkflowId = async ({ params }: WorkflowIdProps) => {
  const { workflowId } = await params;
  await requireAuth();
  prefetchWorkflow(workflowId);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EditorError />}>
        <Suspense fallback={<EditorLoding />}>
          <EditorHeader workflowId={workflowId} />
          <main className="flex-1">
            <Editor workflowId={workflowId} />
          </main>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default WorkflowId;
