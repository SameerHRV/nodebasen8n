import {
  WorkflowError,
  WorkflowLoding,
  WorkflowsContainer,
  WorkflowsList,
} from "@/features/workflows/components/workflows";
import { workflowParamsLoader } from "@/features/workflows/server/params-loader";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  searchParams: Promise<SearchParams>;
};

const WorkFlowPage = async ({ searchParams }: Props) => {
  await requireAuth();

  const params = await workflowParamsLoader(searchParams);
  prefetchWorkflows(params);

  return (
    <WorkflowsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<WorkflowError />}>
          <Suspense fallback={<WorkflowLoding />}>
            <WorkflowsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  );
};

export default WorkFlowPage;
