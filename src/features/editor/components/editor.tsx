"use client";

import { ErrorView, LodingView } from "@/components/web/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";

export const EditorLoding = () => {
  return <LodingView message="Loading Editor...." />;
};
export const EditorError = () => {
  return <ErrorView message="Failed to load Editor...." />;
};

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);

  return (
    <div>
      <p>{JSON.stringify(workflow, null, 2)}</p>
    </div>
  );
};
